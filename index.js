// ============================================================
//  CODZERO WhatsApp Bot
//  Developer: MRZEROEXPLOIT & PAYOEBOI
//  Contact:   +263780706627
//  Email:     mrzeroexploit@gmail.com
// ============================================================
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const chalk = require("chalk");
const path = require("path");

const config = require("./config");
const db = require("./lib/db");

const coreCommands = require("./commands/core");
const groupCommands = require("./commands/group");
const utilityCommands = require("./commands/utility");
const funCommands = require("./commands/fun");

const allCommands = [...coreCommands, ...groupCommands, ...utilityCommands, ...funCommands];
const commandMap = new Map();
for (const cmd of allCommands) {
  commandMap.set(cmd.name, cmd);
  for (const alias of cmd.aliases || []) commandMap.set(alias, cmd);
}

const runtimeConfig = { mode: config.mode };

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "session"));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["CODZERO", "Chrome", "1.0.0"]
  });

  // ---- Pairing code flow (legitimate WhatsApp-native linking) ----
  if (!sock.authState.creds.registered) {
    console.log(chalk.yellow("\n=== CODZERO Pairing ==="));
    console.log("Enter your WhatsApp number with country code, no + and no spaces.");
    console.log("Example: 263780706627\n");
    const phoneNumber = await question("Phone number: ");
    const code = await sock.requestPairingCode(phoneNumber.trim());
    console.log(chalk.green(`\nYour pairing code: ${code}`));
    console.log("On your phone: WhatsApp > Linked Devices > Link a Device > Link with phone number instead");
    console.log("Enter the code above when prompted.\n");
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red("Connection closed."), shouldReconnect ? "Reconnecting..." : "Logged out — delete /session folder to re-pair.");
      if (shouldReconnect) {
        setTimeout(startBot, config.reconnect.retryDelayMs);
      }
    } else if (connection === "open") {
      console.log(chalk.green(`✅ ${config.botName} is connected and online.`));
    }
  });

  // ---- Group participant events (welcome / bye) ----
  sock.ev.on("group-participants.update", async (event) => {
    try {
      const settings = db.getGroupSettings(event.id);
      const groupMeta = await sock.groupMetadata(event.id);
      for (const participant of event.participants) {
        const userTag = `@${participant.split("@")[0]}`;
        if (event.action === "add" && settings.welcome) {
          const template = settings.welcomeMsg || `👋 Welcome {user} to *{group}*! Please read the group description.`;
          const text = template.replace("{user}", userTag).replace("{group}", groupMeta.subject);
          await sock.sendMessage(event.id, { text, mentions: [participant] });
        }
        if (event.action === "remove" && settings.bye) {
          const template = settings.byeMsg || `👋 {user} has left *{group}*. Goodbye!`;
          const text = template.replace("{user}", userTag).replace("{group}", groupMeta.subject);
          await sock.sendMessage(event.id, { text, mentions: [participant] });
        }
      }
    } catch (e) {
      // group might not be resolvable yet; ignore
    }
  });

  // ---- Main message handler ----
  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith("@g.us");
      const sender = isGroup ? msg.key.participant : from;

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      // ---- Antilink / Antispam enforcement (runs on every group message, not just commands) ----
      if (isGroup) {
        const settings = db.getGroupSettings(from);
        const groupMeta = await sock.groupMetadata(from);
        const senderIsAdmin = groupCommands.isAdminCheck(groupMeta, sender);

        if (settings.antilink && !senderIsAdmin) {
          const linkRegex = /(https?:\/\/|chat\.whatsapp\.com|wa\.me)/i;
          if (linkRegex.test(body)) {
            await sock.sendMessage(from, { delete: msg.key });
            const warnings = db.addWarning(from, sender);
            if (warnings >= config.antilink.maxWarnings) {
              await sock.groupParticipantsUpdate(from, [sender], "remove");
              db.resetWarnings(from, sender);
              await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]} removed for repeated link posting.`, mentions: [sender] });
            } else {
              await sock.sendMessage(from, { text: `⚠️ @${sender.split("@")[0]} links aren't allowed here. Warning ${warnings}/${config.antilink.maxWarnings}.`, mentions: [sender] });
            }
            return; // don't process further as a command
          }
        }

        if (settings.antispam && !senderIsAdmin) {
          const now = Date.now();
          const record = db.getSpamRecord(from, sender);
          if (record.mutedUntil && now < record.mutedUntil) {
            await sock.sendMessage(from, { delete: msg.key });
            return;
          }
          record.timestamps = (record.timestamps || []).filter(t => now - t < config.antispam.windowSeconds * 1000);
          record.timestamps.push(now);
          if (record.timestamps.length > config.antispam.maxMessages) {
            record.mutedUntil = now + config.antispam.muteSeconds * 1000;
            db.setSpamRecord(from, sender, record);
            await sock.sendMessage(from, { text: `🔇 @${sender.split("@")[0]} muted for ${config.antispam.muteSeconds}s for spamming.`, mentions: [sender] });
            return;
          }
          db.setSpamRecord(from, sender, record);
        }
      }

      // ---- Command parsing ----
      if (!body.startsWith(config.prefix)) return;
      const args = body.slice(config.prefix.length).trim().split(/\s+/);
      const cmdName = args.shift()?.toLowerCase();
      if (!cmdName) return;

      const cmd = commandMap.get(cmdName);
      if (!cmd) return;

      const isOwnerSender = config.ownerNumbers.includes(sender);

      if (runtimeConfig.mode === "private" && !isOwnerSender) return;
      if (cmd.ownerOnly && !isOwnerSender) {
        return sock.sendMessage(from, { text: "🔒 This command is for the bot owner only." });
      }
      if (cmd.groupOnly && !isGroup) {
        return sock.sendMessage(from, { text: "⚠️ This command only works in groups." });
      }

      let groupMeta = null;
      let mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (isGroup) {
        groupMeta = await sock.groupMetadata(from);
        if (cmd.adminOnly) {
          const senderIsAdmin = groupCommands.isAdminCheck(groupMeta, sender);
          if (!senderIsAdmin && !isOwnerSender) {
            return sock.sendMessage(from, { text: "🔒 This command is for group admins only." });
          }
        }
      }

      await cmd.execute({
        sock,
        msg,
        from,
        sender,
        args,
        mentioned,
        groupMeta,
        runtimeConfig,
        allCommands,
        isOwner: isOwnerSender
      });

    } catch (err) {
      console.error(chalk.red("Message handler error:"), err.message);
    }
  });

  return sock;
}

console.log(chalk.cyan(`
╔════════════════════════════════╗
║          ${config.botName} BOT
║  Dev: ${config.developer}
║  ${config.contact} | ${config.email}
╚════════════════════════════════╝
`));

startBot().catch(err => {
  console.error(chalk.red("Fatal startup error:"), err);
  process.exit(1);
});
