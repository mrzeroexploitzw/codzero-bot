// ============================================================
//  CODZERO — commands/fun/index.js  (Fun & Info)
// ============================================================
const axios = require("axios");
const config = require("../../config");

module.exports = [
  {
    name: "menu",
    aliases: ["commands", "help"],
    description: "Show all available commands",
    category: "fun",
    async execute({ sock, from, commands }) {
      const byCategory = {};
      const uniqueCommands = [...new Set(commands.values())];
      for (const cmd of uniqueCommands) {
        byCategory[cmd.category] = byCategory[cmd.category] || [];
        byCategory[cmd.category].push(cmd.name);
      }
      const labels = { core: "⚙️ CORE / OWNER", group: "👥 GROUP MANAGEMENT", utility: "🛠️ UTILITY", fun: "🎉 FUN / INFO" };
      let text = `╭───────────────╮\n│ *${config.botName} MENU*\n╰───────────────╯\n\n`;
      for (const cat of Object.keys(byCategory)) {
        text += `*${labels[cat] || cat.toUpperCase()}*\n`;
        text += byCategory[cat].map(n => `• ${config.prefix}${n}`).join("\n");
        text += "\n\n";
      }
      text += `Prefix: *${config.prefix}*\nDev: ${config.developer}\nContact: ${config.contact}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    name: "owner",
    aliases: [],
    description: "Get the bot owner's contact card",
    category: "fun",
    async execute({ sock, from }) {
      await sock.sendMessage(from, {
        contacts: {
          displayName: config.developer,
          contacts: [{
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.developer}\nTEL;type=CELL;type=VOICE;waid=${config.contact.replace("+", "")}:${config.contact}\nEMAIL:${config.email}\nEND:VCARD`
          }]
        }
      });
    }
  },
  {
    name: "about",
    aliases: ["whoami"],
    description: "Learn about CODZERO bot",
    category: "fun",
    async execute({ sock, from }) {
      const text = `🤖 *I am ${config.botName}*\n\n` +
        `A multi-purpose WhatsApp assistant built for group management, ` +
        `utilities, and fun commands.\n\n` +
        `👨‍💻 Developer: ${config.developer}\n` +
        `📞 Contact: ${config.contact}\n` +
        `📧 Email: ${config.email}\n\n` +
        `Type *${config.prefix}menu* to see what I can do.`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    name: "runtime",
    aliases: [],
    description: "Show system runtime info (memory, platform)",
    category: "fun",
    async execute({ sock, from }) {
      const mem = process.memoryUsage();
      const text = `📊 *Runtime Info*\n\n` +
        `Platform: ${process.platform}\n` +
        `Node: ${process.version}\n` +
        `Memory used: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    name: "speed",
    aliases: [],
    description: "Test message round-trip speed",
    category: "fun",
    async execute({ sock, from }) {
      const t0 = Date.now();
      await sock.sendMessage(from, { text: "Measuring..." });
      await sock.sendMessage(from, { text: `⚡ Response speed: ${Date.now() - t0}ms` });
    }
  },
  {
    name: "joke",
    aliases: [],
    description: "Get a random joke",
    category: "fun",
    async execute({ sock, from }) {
      try {
        const { data } = await axios.get("https://official-joke-api.appspot.com/random_joke", { timeout: 8000 });
        await sock.sendMessage(from, { text: `😂 ${data.setup}\n\n${data.punchline}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Couldn't fetch a joke right now." });
      }
    }
  },
  {
    name: "meme",
    aliases: [],
    description: "Get a random meme image",
    category: "fun",
    async execute({ sock, from }) {
      try {
        const { data } = await axios.get("https://meme-api.com/gimme", { timeout: 8000 });
        await sock.sendMessage(from, { image: { url: data.url }, caption: data.title });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Couldn't fetch a meme right now." });
      }
    }
  },
  {
    name: "credits",
    aliases: [],
    description: "Show credits",
    category: "fun",
    async execute({ sock, from }) {
      await sock.sendMessage(from, {
        text: `✨ *${config.botName}* ✨\n\nDeveloped by:\n• MRZEROEXPLOIT\n• PAYOEBOI\n\n📞 ${config.contact}\n📧 ${config.email}`
      });
    }
  }
];
