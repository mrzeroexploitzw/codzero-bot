// ============================================================
//  CODZERO — commands/utility/index.js
// ============================================================
const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");

module.exports = [
  {
    name: "quote",
    aliases: ["quotes"],
    description: "Get a random inspirational quote",
    category: "utility",
    async execute({ sock, from }) {
      try {
        const { data } = await axios.get("https://api.quotable.io/random", { timeout: 8000 });
        await sock.sendMessage(from, { text: `💬 "${data.content}"\n— ${data.author}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Couldn't fetch a quote right now, try again shortly." });
      }
    }
  },
  {
    name: "sticker",
    aliases: ["s"],
    description: "Convert a replied/sent image into a sticker",
    category: "utility",
    async execute({ sock, from, msg }) {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const hasImg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!hasImg) return sock.sendMessage(from, { text: "📸 Reply to an image with .sticker (or send an image captioned .sticker)" });
      try {
        const target = quoted?.imageMessage
          ? { message: quoted, key: msg.message.extendedTextMessage.contextInfo }
          : msg;
        const buffer = await downloadMediaMessage(target, "buffer", {});
        const sharp = require("sharp");
        const webp = await sharp(buffer).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp().toBuffer();
        await sock.sendMessage(from, { sticker: webp });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to create sticker: " + e.message });
      }
    }
  },
  {
    name: "toimg",
    aliases: ["toimage"],
    description: "Convert a replied sticker back into an image",
    category: "utility",
    async execute({ sock, from, msg }) {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.stickerMessage) return sock.sendMessage(from, { text: "Reply to a sticker with .toimg" });
      try {
        const target = { message: quoted, key: msg.message.extendedTextMessage.contextInfo };
        const buffer = await downloadMediaMessage(target, "buffer", {});
        await sock.sendMessage(from, { image: buffer });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed: " + e.message });
      }
    }
  },
  {
    name: "define",
    aliases: ["dict"],
    description: "Look up a word's definition",
    category: "utility",
    async execute({ sock, from, args }) {
      const word = args.join(" ");
      if (!word) return sock.sendMessage(from, { text: "Usage: .define <word>" });
      try {
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { timeout: 8000 });
        const entry = data[0];
        const meaning = entry.meanings[0];
        const def = meaning.definitions[0];
        let text = `📖 *${entry.word}* (${meaning.partOfSpeech})\n\n${def.definition}`;
        if (def.example) text += `\n\nExample: "${def.example}"`;
        await sock.sendMessage(from, { text });
      } catch (e) {
        await sock.sendMessage(from, { text: `❌ No definition found for "${word}"` });
      }
    }
  },
  {
    name: "calc",
    aliases: ["calculate"],
    description: "Evaluate a math expression",
    category: "utility",
    async execute({ sock, from, args }) {
      const expr = args.join(" ");
      if (!expr) return sock.sendMessage(from, { text: "Usage: .calc <expression>  e.g. .calc 12*(4+3)" });
      if (!/^[0-9+\-*/().\s%^]+$/.test(expr)) {
        return sock.sendMessage(from, { text: "❌ Only numbers and + - * / ( ) % are allowed." });
      }
      try {
        const safeExpr = expr.replace(/\^/g, "**");
        const result = Function(`"use strict"; return (${safeExpr})`)();
        await sock.sendMessage(from, { text: `🧮 ${expr} = *${result}*` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Invalid expression." });
      }
    }
  },
  {
    name: "translate",
    aliases: ["tr"],
    description: "Translate text. Usage: .translate <lang_code> <text>",
    category: "utility",
    async execute({ sock, from, args }) {
      const lang = args[0];
      const text = args.slice(1).join(" ");
      if (!lang || !text) return sock.sendMessage(from, { text: "Usage: .translate <lang_code> <text>  e.g. .translate fr Hello there" });
      try {
        const { data } = await axios.get("https://api.mymemory.translated.net/get", {
          params: { q: text, langpair: `en|${lang}` },
          timeout: 8000
        });
        await sock.sendMessage(from, { text: `🌐 ${data.responseData.translatedText}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Translation failed." });
      }
    }
  },
  {
    name: "shorturl",
    aliases: ["short"],
    description: "Shorten a long URL",
    category: "utility",
    async execute({ sock, from, args }) {
      const url = args[0];
      if (!url) return sock.sendMessage(from, { text: "Usage: .shorturl <url>" });
      try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 8000 });
        await sock.sendMessage(from, { text: `🔗 ${data}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to shorten URL." });
      }
    }
  },
  {
    name: "qr",
    aliases: ["qrcode"],
    description: "Generate a QR code image from text",
    category: "utility",
    async execute({ sock, from, args }) {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Usage: .qr <text or url>" });
      try {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
        const { data } = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
        await sock.sendMessage(from, { image: Buffer.from(data), caption: `📱 QR for: ${text}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to generate QR code." });
      }
    }
  }
];
