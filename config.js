// ============================================================
//  CODZERO Bot Configuration
// ============================================================
module.exports = {
  botName: "CODZERO",
  developer: "MRZEROEXPLOIT & PAYOEBOI",
  contact: "+263780706627",
  email: "mrzeroexploit@gmail.com",

  // Owner number(s) — full number with country code, no + and no spaces, then @s.whatsapp.net
  // e.g. "263780706627@s.whatsapp.net"
  ownerNumbers: [
    "263780706627@s.whatsapp.net"
  ],

  // Command prefix
  prefix: ".",

  // Bot mode: "public" = anyone can use commands, "private" = owner only
  mode: "public",

  // Antilink settings (default)
  antilink: {
    enabledByDefault: false, // group admins turn on with .antilink on
    action: "kick", // "warn" | "delete" | "kick"  -> kick = delete + kick after 2 warnings
    maxWarnings: 2
  },

  // Antispam settings
  antispam: {
    enabledByDefault: false,
    maxMessages: 6,      // max messages
    windowSeconds: 10,    // per this many seconds
    muteSeconds: 60       // mute duration after triggering
  },

  // Auto reconnect
  reconnect: {
    maxRetries: 50,
    retryDelayMs: 5000
  }
};
