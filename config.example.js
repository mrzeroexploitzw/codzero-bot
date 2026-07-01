// ============================================================
//  CODZERO — config.example.js
//  Copy this to config.js and fill in your details
// ============================================================
module.exports = {
  botName: "CODZERO",
  prefix: ".",
  developer: "YOUR NAME",
  contact: "YOUR WHATSAPP NUMBER",
  ownerNumbers: ["263XXXXXXXXX@s.whatsapp.net"],
  mode: "public", // public or private
  antilink: {
    maxWarnings: 3
  },
  antispam: {
    maxMessages: 8,
    windowSeconds: 10,
    muteSeconds: 60
  },
  reconnect: {
    maxRetries: 99999,
    retryDelayMs: 5000
  }
};
