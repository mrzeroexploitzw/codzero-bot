// ============================================================
//  CODZERO — commands/core/*.js  (Core / Owner commands)
// ============================================================
const fs = require("fs-extra");
const path = require("path");
const config = require("../../config");

const isOwner = (sender, ownerNumbers) => ownerNumbers.includes(sender);

module.exports = [
  {
    name: "ping",
    aliases: [],
    description: "Check if the bot is alive and response speed",
    category: "core",
    ownerOnly: false,
    async execute({ sock, msg, from }) {
      const start = Date.now();
      const sent = await sock.sendMessage(from, { text: "🏓 Pinging..." }, { quoted: msg });
      const ms = Date.now() - start;
      await sock.sendMessage(from, { text: `🏓 Pong! ${ms}ms`, edit: sent.key }).catch(() => {
        sock.sendMessage(from, { text: `🏓 Pong! ${ms}ms` });
      });
    }
  },
  {
    name: "uptime",
    aliases: [],
    description: "Show how long the bot has been running",
    category: "core",
    async execute({ sock, from }) {
      const s = process.uptime();
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      await sock.sendMessage(from, { text: `⏱️ Uptime: ${h}h ${m}m ${sec}s` });
    }
  },
  {
    name: "mode",
    aliases: [],
    description: "Set bot mode: public or private (owner only)",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from, args, runtimeConfig }) {
      const choice = (args[0] || "").toLowerCase();
      if (!["public", "private"].includes(choice)) {
        return sock.sendMessage(from, { text: "Usage: .mode public | .mode private" });
      }
      runtimeConfig.mode = choice;
      await sock.sendMessage(from, { text: `✅ Bot mode set to *${choice}*` });
    }
  },
  {
    name: "restart",
    aliases: [],
    description: "Restart the bot process (owner only, requires process manager)",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from }) {
      await sock.sendMessage(from, { text: "♻️ Restarting CODZERO..." });
      setTimeout(() => process.exit(0), 1000);
      // Note: use `bash autorun.sh` or pm2/termux-services so the process
      // actually comes back up after exit. See README section "Keeping it alive".
    }
  },
  {
    name: "broadcast",
    aliases: ["bc"],
    description: "Send a message to all groups the bot is in (owner only)",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from, args, sock_groupList }) {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Usage: .broadcast <message>" });
      const groups = await sock.groupFetchAllParticipating();
      const ids = Object.keys(groups);
      let count = 0;
      for (const gid of ids) {
        try {
          await sock.sendMessage(gid, { text: `📢 *Broadcast from ${config.botName}*\n\n${text}` });
          count++;
          await new Promise(r => setTimeout(r, 1500)); // throttle to avoid spam flags
        } catch (e) {}
      }
      await sock.sendMessage(from, { text: `✅ Broadcast sent to ${count} group(s).` });
    }
  },
  {
    name: "setpp",
    aliases: ["setprofilepic"],
    description: "Set bot's WhatsApp profile picture. Reply to an image with this command.",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from, msg }) {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const target = quoted?.imageMessage ? quoted : msg.message?.imageMessage ? msg.message : null;
      if (!target) {
        return sock.sendMessage(from, { text: "📸 Reply to an image with *.setpp* to set it as the bot's profile picture." });
      }
      try {
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
        const fakeMsg = quoted?.imageMessage
          ? { message: quoted, key: msg.message.extendedTextMessage.contextInfo }
          : msg;
        const buffer = await downloadMediaMessage(fakeMsg, "buffer", {});
        await sock.updateProfilePicture(sock.user.id, buffer);
        await sock.sendMessage(from, { text: "✅ Profile picture updated." });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to set profile picture: " + e.message });
      }
    }
  },
  {
    name: "setbio",
    aliases: [],
    description: "Set the bot's WhatsApp About/status text (owner only)",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from, args }) {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Usage: .setbio <text>" });
      try {
        await sock.updateProfileStatus(text);
        await sock.sendMessage(from, { text: "✅ Bio updated." });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed: " + e.message });
      }
    }
  },
  {
    name: "eval",
    aliases: [">"],
    description: "Run a raw JS snippet (owner only, sandboxed to this process — use with care)",
    category: "core",
    ownerOnly: true,
    async execute({ sock, from, args, msg, sock_self }) {
      const code = args.join(" ");
      if (!code) return sock.sendMessage(from, { text: "Usage: .eval <code>" });
      try {
        let result = await eval(`(async () => { ${code} })()`);
        if (typeof result !== "string") result = require("util").inspect(result);
        await sock.sendMessage(from, { text: "```" + result.slice(0, 2000) + "```" });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Error: " + e.message });
      }
    }
  }
];
