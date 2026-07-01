// Auto-features run from index.js event handlers
// exported for use in messages.upsert

const axios = require("axios");

async function autoAIReply(sock, from, sender, body) {
  try {
    const res = await axios.post("https://api.anthropic.com/v1/messages", {
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: "You are CODZERO AI, a helpful WhatsApp assistant. Reply concisely and helpfully. No markdown, keep it short for WhatsApp.",
      messages: [{ role: "user", content: body }]
    }, {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      }
    });
    const reply = res.data.content[0].text;
    await sock.sendMessage(from, { text: "🤖 " + reply });
  } catch (e) {}
}

module.exports = { autoAIReply };
