const QRCode = require("qrcode");
const jsQR = require("jsqr");
const Jimp = require("jimp");
const gtts = require("node-gtts")("en");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = [
  {
    name: "tts",
    description: "Convert text to speech. Usage: .tts <text>",
    category: "media2",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .tts <text>" });
      const text = args.join(" ");
      const filePath = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
      try {
        await new Promise((resolve, reject) => {
          gtts.save(filePath, text, (err) => err ? reject(err) : resolve());
        });
        await sock.sendMessage(from, { audio: fs.readFileSync(filePath), mimetype: "audio/mpeg", ptt: true });
        fs.removeSync(filePath);
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ TTS failed: " + e.message });
      }
    }
  },
  {
    name: "qrread",
    description: "Read a QR code from a replied/sent image",
    category: "media2",
    async execute({ sock, from, msg }) {
      const quoted = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      if (!quoted) return sock.sendMessage(from, { text: "❌ Send or reply to an image containing a QR code." });
      try {
        const { downloadMediaMessage } = require("@whiskeysockets/baileys");
        const buffer = await downloadMediaMessage({ message: { imageMessage: quoted } }, "buffer", {});
        const image = await Jimp.read(buffer);
        const decoded = jsQR(new Uint8ClampedArray(image.bitmap.data), image.bitmap.width, image.bitmap.height);
        if (!decoded) return sock.sendMessage(from, { text: "❌ No QR code detected." });
        await sock.sendMessage(from, { text: `📷 *QR CONTENT:*\n\n${decoded.data}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to read QR: " + e.message });
      }
    }
  }
];
