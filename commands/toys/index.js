const axios = require("axios");

module.exports = [
  {
    name: "fact",
    description: "Random useless fact",
    category: "toys",
    async execute({ sock, from }) {
      try {
        const { data } = await axios.get("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
        await sock.sendMessage(from, { text: "🧠 *FACT*\n\n" + data.text });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Couldn't fetch a fact right now." });
      }
    }
  },
  {
    name: "8ball",
    aliases: ["ask"],
    description: "Ask the magic 8-ball. Usage: .8ball <question>",
    category: "toys",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .8ball <question>" });
      const answers = ["Yes.", "No.", "Maybe.", "Definitely.", "Ask again later.", "Unlikely.", "Without a doubt.", "I wouldn't count on it."];
      const a = answers[Math.floor(Math.random() * answers.length)];
      await sock.sendMessage(from, { text: "🎱 " + a });
    }
  },
  {
    name: "coinflip",
    aliases: ["flip"],
    description: "Flip a coin",
    category: "toys",
    async execute({ sock, from }) {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      await sock.sendMessage(from, { text: "🪙 " + result + "!" });
    }
  },
  {
    name: "dice",
    aliases: ["roll"],
    description: "Dice game — pick a number 1-6, bot rolls too. Highest wins! Usage: .dice <1-6>",
    category: "toys",
    async execute({ sock, from, args }) {
      const pick = parseInt(args[0]);
      if (isNaN(pick) || pick < 1 || pick > 6) {
        return sock.sendMessage(from, { text: "🎲 *DICE GAME*\n\nPick a number between 1 and 6!\nUsage: .dice <1-6>" });
      }
      const botRoll = Math.floor(Math.random() * 6) + 1;
      const emoji = ["", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];
      let result;
      if (pick > botRoll) result = "🏆 *YOU WIN!*";
      else if (pick < botRoll) result = "🤖 *BOT WINS!*";
      else result = "🤝 *IT IS A TIE!*";
      const text = "🎲 *DICE GAME*\n\nYour roll: " + emoji[pick] + " (" + pick + ")\nBot roll:  " + emoji[botRoll] + " (" + botRoll + ")\n\n" + result;
      await sock.sendMessage(from, { text });
    }
  },
  {
    name: "poll",
    description: "Create a simple poll. Usage: .poll Question | Option1 | Option2",
    category: "toys",
    async execute({ sock, from, args }) {
      const text = args.join(" ");
      const parts = text.split("|").map(s => s.trim()).filter(Boolean);
      if (parts.length < 3) return sock.sendMessage(from, { text: "Usage: .poll Question | Option1 | Option2" });
      const [question, ...options] = parts;
      const body = "📊 *" + question + "*\n\n" + options.map((o, i) => (i + 1) + ". " + o).join("\n") + "\n\nReply with the option number to vote.";
      await sock.sendMessage(from, { text: body });
    }
  },
  {
    name: "remindme",
    aliases: ["remind"],
    description: "Set a reminder. Usage: .remindme <minutes> <text>",
    category: "toys",
    async execute({ sock, from, args }) {
      if (args.length < 2) return sock.sendMessage(from, { text: "Usage: .remindme 10 Take a break" });
      const mins = parseFloat(args[0]);
      const text = args.slice(1).join(" ");
      if (isNaN(mins) || mins <= 0) return sock.sendMessage(from, { text: "❌ Invalid number of minutes." });
      await sock.sendMessage(from, { text: "⏰ Reminder set for " + mins + " minute(s)." });
      setTimeout(() => {
        sock.sendMessage(from, { text: "⏰ *REMINDER:* " + text });
      }, mins * 60 * 1000);
    }
  }
];
