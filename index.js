// ============================================================
//  CODZERO — index.js  (Main entry: connection, pairing, router)
//  Developer: MRZEROEXPLOIT & PAYOEBOI
// ============================================================
const { showBanner } = require("./codzero-banner");
const { autoAIReply } = require("./commands/ai/auto");
const fs = require("fs-extra");
const path = require("path");
const readline = require("readline");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = require("@whiskeysockets/baileys");
const pino = require("pino");

const config = require("./config");
const db = require("./lib/db");

const SESSION_DIR = path.join(__dirname, "session");
fs.ensureDirSync(SESSION_DIR);

const commandFiles = {
  core: require("./commands/core/index.js"),
  group: require("./commands/group/index.js"),
  utility: require("./commands/utility/index.js"),
  fun: require("./commands/fun/index.js"),
  info: require("./commands/info/index.js"),
  web: require("./commands/web/index.js"),
  utility2: require("./commands/utility2/index.js"),
  toys: require("./commands/toys/index.js"),
  media2: require("./commands/media2/index.js"),
  groupadmin: require("./commands/groupadmin/index.js"),
  premiumadmin: require("./commands/premiumadmin/index.js")
};

const commands = new Map();
for (const category of Object.values(commandFiles)) {
  for (const cmd of category) {
    commands.set(cmd.name, cmd);
    if (Array.isArray(cmd.aliases)) {
      for (const alias of cmd.aliases) commands.set(alias, cmd);
    }
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

function isOwner(jid) {
  return config.ownerNumbers.includes(jid);
}

let retries = 0;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu("Chrome")
  });

  if (!sock.authState.creds.registered) {
    const phoneNumber = await ask(
      "\n[CODZERO] Enter your WhatsApp number with country code, no + and no spaces (e.g. 263780706627): "
    );
    try {
      const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ""));
      console.log("\n[CODZERO] Your pairing code: " + code);
      console.log("On your phone: WhatsApp > Settings > Linked Devices > Link a Device > Link with phone number instead\n");
    } catch (e) {
      console.error("[CODZERO] Failed to request pairing code:", e.message);
    }
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      retries = 0;
      console.log("\x1b[38;5;46m\x1b[1m[CODZERO] ✅ Connected as " + config.botName + ". " + commands.size + " command aliases loaded.\x1b[0m");
      try {
        if (config.ownerNumbers[0]) {
          await sock.sendMessage(config.ownerNumbers[0], {
            text: "*" + config.botName + "* is online and connected.\nDeveloper: " + config.developer + "\nPrefix: " + config.prefix + "\nSend *.menu* to see all commands."
          });
        }
      } catch (e) {}
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (loggedOut) {
        console.log("\x1b[38;5;196m[CODZERO] Logged out. Delete the session/ folder and re-pair.\x1b[0m");
        return;
      }

      retries++;
      if (retries > config.reconnect.maxRetries) {
        console.log("\x1b[38;5;196m[CODZERO] Max reconnect attempts reached. Exiting.\x1b[0m");
        process.exit(1);
      }
      console.log("\x1b[38;5;214m[CODZERO] Connection closed. Reconnecting (" + retries + "/" + config.reconnect.maxRetries + ")...\x1b[0m");
      setTimeout(startBot, config.reconnect.retryDelayMs);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    if (isGroup) {
      try {
        const settings = db.getGroupSettings(from);
        const groupMeta = await sock.groupMetadata(from);
        const participantObj = groupMeta.participants.find((p) => p.id === sender);
        const senderIsAdmin = participantObj && (participantObj.admin === "admin" || participantObj.admin === "superadmin");

        if (settings.antilink && !senderIsAdmin && !isOwner(sender)) {
          const linkRegex = /(https?:\/\/|chat\.whatsapp\.com|wa\.me)/i;
          if (linkRegex.test(body)) {
            await sock.sendMessage(from, { delete: msg.key });
            const warnCount = db.addWarning(from, sender);
            if (warnCount >= config.antilink.maxWarnings) {
              await sock.groupParticipantsUpdate(from, [sender], "remove");
              db.resetWarnings(from, sender);
              await sock.sendMessage(from, { text: "Removed @" + sender.split("@")[0] + " for repeated link sharing.", mentions: [sender] });
            } else {
              await sock.sendMessage(from, { text: "@" + sender.split("@")[0] + " links are not allowed here. Warning " + warnCount + "/" + config.antilink.maxWarnings + ".", mentions: [sender] });
            }
            return;
          }
        }

        if (settings.antispam && !senderIsAdmin && !isOwner(sender)) {
          const record = db.getSpamRecord(from, sender);
          const now = Date.now();
          if (record.mutedUntil > now) return;
          record.timestamps = record.timestamps.filter((t) => now - t < config.antispam.windowSeconds * 1000);
          record.timestamps.push(now);
          if (record.timestamps.length > config.antispam.maxMessages) {
            record.mutedUntil = now + config.antispam.muteSeconds * 1000;
            db.setSpamRecord(from, sender, record);
            await sock.sendMessage(from, { text: "@" + sender.split("@")[0] + " muted for " + config.antispam.muteSeconds + "s (spam detected).", mentions: [sender] });
            return;
          }
          db.setSpamRecord(from, sender, record);
        }
      } catch (e) {
        console.error("[CODZERO] Group pre-processing error:", e.message);
      }
    }

    if (!body.startsWith(config.prefix)) return;
    const args = body.slice(config.prefix.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const cmd = commands.get(cmdName);
    if (!cmd) return;

    if (cmd.ownerOnly && !isOwner(sender)) {
      await sock.sendMessage(from, { text: "This command is owner-only." });
      return;
    }
    if (config.mode === "private" && !isOwner(sender)) {
      return;
    }

    try {
      await cmd.execute({ sock, from, sender, args, msg, isGroup, config, db, commands });
    } catch (e) {
      console.error("[CODZERO] Error in command \"" + cmdName + "\":", e);
      await sock.sendMessage(from, { text: "Error running ." + cmdName + ": " + e.message });
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    try {
      const settings = db.getGroupSettings(update.id);
      const groupMeta = await sock.groupMetadata(update.id);
      for (const p of update.participants) {
        const participant = typeof p === "string" ? p : p.id;
        if (update.action === "add" && settings.welcome) {
          const text = settings.welcomeMsg
            ? settings.welcomeMsg.replace("{user}", "@" + participant.split("@")[0]).replace("{group}", groupMeta.subject)
            : "Welcome @" + participant.split("@")[0] + " to *" + groupMeta.subject + "*!";
          await sock.sendMessage(update.id, { text, mentions: [participant] });
        }
        if (update.action === "remove" && settings.bye) {
          const text = settings.byeMsg
            ? settings.byeMsg.replace("{user}", "@" + participant.split("@")[0]).replace("{group}", groupMeta.subject)
            : "@" + participant.split("@")[0] + " left the group.";
          await sock.sendMessage(update.id, { text, mentions: [participant] });
        }
      }
    } catch (e) {
      console.error("[CODZERO] Welcome/Bye error:", e.message);
    }
  });

  return sock;
}

process.on("uncaughtException", (err) => {
  console.error("[CODZERO] Uncaught exception (auto-fix: continuing):", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("[CODZERO] Unhandled rejection (auto-fix: continuing):", err);
});

(async () => {
  await showBanner();
  startBot();
})();
