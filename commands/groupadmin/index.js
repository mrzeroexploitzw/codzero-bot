const fs = require("fs-extra");
const path = require("path");
const dataDir = path.join(__dirname, "../../data");
fs.ensureDirSync(dataDir);

module.exports = [
  {
    name: "mute",
    aliases: ["groupclose"],
    description: "Restrict group to admins only",
    category: "groupadmin",
    async execute({ sock, from, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      await sock.groupSettingUpdate(from, "announcement");
      await sock.sendMessage(from, { text: "🔇 Group muted — admins only." });
    }
  },
  {
    name: "unmute",
    aliases: ["groupopen"],
    description: "Allow all members to message",
    category: "groupadmin",
    async execute({ sock, from, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      await sock.groupSettingUpdate(from, "not_announcement");
      await sock.sendMessage(from, { text: "🔊 Group unmuted." });
    }
  },
  {
    name: "resetlink",
    aliases: ["newlink"],
    description: "Regenerate group invite link",
    category: "groupadmin",
    async execute({ sock, from, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      try {
        const code = await sock.groupRevokeInvite(from);
        await sock.sendMessage(from, { text: `🔗 New invite link:\nhttps://chat.whatsapp.com/${code}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed (bot needs admin)." });
      }
    }
  },
  {
    name: "groupjid",
    aliases: ["gjid"],
    description: "Show group JID",
    category: "groupadmin",
    async execute({ sock, from, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      await sock.sendMessage(from, { text: `🆔 Group JID:\n${from}` });
    }
  },
  {
    name: "setname",
    description: "Change group name. Usage: .setname <name>",
    category: "groupadmin",
    async execute({ sock, from, args, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .setname <name>" });
      try {
        await sock.groupUpdateSubject(from, args.join(" "));
        await sock.sendMessage(from, { text: "✅ Group name updated." });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed (bot needs admin)." });
      }
    }
  },
  {
    name: "groupinfo",
    aliases: ["ginfo"],
    description: "Show group metadata",
    category: "groupadmin",
    async execute({ sock, from, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      try {
        const meta = await sock.groupMetadata(from);
        await sock.sendMessage(from, { text: `👥 *${meta.subject}*\n\nMembers: ${meta.participants.length}\nCreated: ${new Date(meta.creation * 1000).toLocaleDateString()}\nDescription: ${meta.desc || "None"}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to fetch group info." });
      }
    }
  },
  {
    name: "warn",
    description: "Warn a user (3 warnings = auto-kick). Usage: .warn @user",
    category: "groupadmin",
    async execute({ sock, from, mentioned, isGroup }) {
      if (!isGroup) return sock.sendMessage(from, { text: "❌ Group only." });
      if (!mentioned?.length) return sock.sendMessage(from, { text: "❌ Mention a user to warn." });
      const warnFile = path.join(dataDir, "warnings.json");
      fs.ensureFileSync(warnFile);
      let warnings = {};
      try { warnings = JSON.parse(fs.readFileSync(warnFile, "utf8") || "{}"); } catch {}
      const user = mentioned[0];
      warnings[user] = (warnings[user] || 0) + 1;
      fs.writeFileSync(warnFile, JSON.stringify(warnings, null, 2));
      if (warnings[user] >= 3) {
        await sock.groupParticipantsUpdate(from, [user], "remove");
        await sock.sendMessage(from, { text: `🚫 @${user.split("@")[0]} hit 3 warnings and was removed.`, mentions: [user] });
        delete warnings[user];
        fs.writeFileSync(warnFile, JSON.stringify(warnings, null, 2));
      } else {
        await sock.sendMessage(from, { text: `⚠️ @${user.split("@")[0]} warned (${warnings[user]}/3)`, mentions: [user] });
      }
    }
  }
];
