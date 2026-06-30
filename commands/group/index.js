// ============================================================
//  CODZERO — commands/group/index.js  (Group Management)
// ============================================================
const db = require("../../lib/db");

function isAdminCheck(groupMeta, jid) {
  const p = groupMeta.participants.find(p => p.id === jid);
  return p && (p.admin === "admin" || p.admin === "superadmin");
}

module.exports = [
  {
    name: "kick",
    aliases: ["remove"],
    description: "Remove a member from the group (admin only). Reply or mention.",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, msg, mentioned }) {
      const target = mentioned[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (!target) return sock.sendMessage(from, { text: "Mention or reply to the user you want to kick." });
      await sock.groupParticipantsUpdate(from, [target], "remove");
      await sock.sendMessage(from, { text: `✅ Removed @${target.split("@")[0]}`, mentions: [target] });
    }
  },
  {
    name: "promote",
    aliases: [],
    description: "Promote a member to admin (admin only)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, mentioned }) {
      if (!mentioned[0]) return sock.sendMessage(from, { text: "Mention the user to promote." });
      await sock.groupParticipantsUpdate(from, [mentioned[0]], "promote");
      await sock.sendMessage(from, { text: `✅ Promoted @${mentioned[0].split("@")[0]}`, mentions: [mentioned[0]] });
    }
  },
  {
    name: "demote",
    aliases: [],
    description: "Demote an admin to regular member (admin only)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, mentioned }) {
      if (!mentioned[0]) return sock.sendMessage(from, { text: "Mention the user to demote." });
      await sock.groupParticipantsUpdate(from, [mentioned[0]], "demote");
      await sock.sendMessage(from, { text: `✅ Demoted @${mentioned[0].split("@")[0]}`, mentions: [mentioned[0]] });
    }
  },
  {
    name: "tagall",
    aliases: ["everyone"],
    description: "Mention all group members (admin only)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, groupMeta, args }) {
      const note = args.join(" ");
      const mentions = groupMeta.participants.map(p => p.id);
      let text = note ? `📢 ${note}\n\n` : "📢 *Tagging everyone*\n\n";
      text += mentions.map(m => `@${m.split("@")[0]}`).join(" ");
      await sock.sendMessage(from, { text, mentions });
    }
  },
  {
    name: "antilink",
    aliases: [],
    description: "Toggle antilink protection. Deletes links; kicks after 2 warnings.",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const choice = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(choice)) return sock.sendMessage(from, { text: "Usage: .antilink on | .antilink off" });
      db.setGroupSetting(from, "antilink", choice === "on");
      await sock.sendMessage(from, { text: `✅ Antilink turned *${choice}*` });
    }
  },
  {
    name: "antispam",
    aliases: [],
    description: "Toggle antispam protection (rate-limits rapid messages, auto-mutes offenders)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const choice = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(choice)) return sock.sendMessage(from, { text: "Usage: .antispam on | .antispam off" });
      db.setGroupSetting(from, "antispam", choice === "on");
      await sock.sendMessage(from, { text: `✅ Antispam turned *${choice}*` });
    }
  },
  {
    name: "welcome",
    aliases: [],
    description: "Toggle welcome messages for new members, or set custom text with .welcome set <text>",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const sub = (args[0] || "").toLowerCase();
      if (sub === "on" || sub === "off") {
        db.setGroupSetting(from, "welcome", sub === "on");
        return sock.sendMessage(from, { text: `✅ Welcome messages *${sub}*` });
      }
      if (sub === "set") {
        const text = args.slice(1).join(" ");
        if (!text) return sock.sendMessage(from, { text: "Usage: .welcome set <text with {user} and {group}>" });
        db.setGroupSetting(from, "welcomeMsg", text);
        return sock.sendMessage(from, { text: "✅ Custom welcome message saved." });
      }
      return sock.sendMessage(from, { text: "Usage: .welcome on|off  or  .welcome set <text>" });
    }
  },
  {
    name: "bye",
    aliases: ["goodbye"],
    description: "Toggle goodbye messages for leaving members, or set custom text with .bye set <text>",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const sub = (args[0] || "").toLowerCase();
      if (sub === "on" || sub === "off") {
        db.setGroupSetting(from, "bye", sub === "on");
        return sock.sendMessage(from, { text: `✅ Goodbye messages *${sub}*` });
      }
      if (sub === "set") {
        const text = args.slice(1).join(" ");
        if (!text) return sock.sendMessage(from, { text: "Usage: .bye set <text with {user} and {group}>" });
        db.setGroupSetting(from, "byeMsg", text);
        return sock.sendMessage(from, { text: "✅ Custom goodbye message saved." });
      }
      return sock.sendMessage(from, { text: "Usage: .bye on|off  or  .bye set <text>" });
    }
  },
  {
    name: "setgdesc",
    aliases: [],
    description: "Set the group description (admin only)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Usage: .setgdesc <text>" });
      await sock.groupUpdateDescription(from, text);
      await sock.sendMessage(from, { text: "✅ Group description updated." });
    }
  },
  {
    name: "lockgroup",
    aliases: ["lock"],
    description: "Restrict messaging to admins only (on) or allow everyone (off)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    async execute({ sock, from, args }) {
      const choice = (args[0] || "").toLowerCase();
      if (!["on", "off"].includes(choice)) return sock.sendMessage(from, { text: "Usage: .lockgroup on | .lockgroup off" });
      await sock.groupSettingUpdate(from, choice === "on" ? "announcement" : "not_announcement");
      db.setGroupSetting(from, "lockGroup", choice === "on");
      await sock.sendMessage(from, { text: `✅ Group ${choice === "on" ? "locked (admins only can message)" : "unlocked"}` });
    }
  }
];

module.exports.isAdminCheck = isAdminCheck;
