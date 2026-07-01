const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  gold: "\x1b[38;5;220m",
  orange: "\x1b[38;5;214m",
  cyan: "\x1b[38;5;51m",
  purple: "\x1b[38;5;129m",
  pink: "\x1b[38;5;213m",
  white: "\x1b[97m",
  gray: "\x1b[38;5;245m",
  bgDark: "\x1b[48;5;235m",
  green: "\x1b[38;5;46m",
  red: "\x1b[38;5;196m",
};

const logo = [
  "  ██████╗ ██████╗ ██████╗ ███████╗███████╗██████╗  ██████╗ ",
  " ██╔════╝██╔═══██╗██╔══██╗╚════██║██╔════╝██╔══██╗██╔═══██╗",
  " ██║     ██║   ██║██║  ██║    ██╔╝█████╗  ██████╔╝██║   ██║",
  " ██║     ██║   ██║██║  ██║   ██╔╝ ██╔══╝  ██╔══██╗██║   ██║",
  " ╚██████╗╚██████╔╝██████╔╝   ██║  ███████╗██║  ██║╚██████╔╝",
  "  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ",
];

const colors = [C.gold, C.orange, C.pink, C.purple, C.cyan, C.cyan];

async function showBanner() {
  console.clear();

  // Animate logo line by line
  for (let i = 0; i < logo.length; i++) {
    process.stdout.write(colors[i] + C.bold + logo[i] + C.reset + "\n");
    await sleep(80);
  }

  await sleep(200);

  // Divider
  const div = C.gold + "  ═══════════════════════════════════════════════════════════" + C.reset;
  console.log(div);
  await sleep(100);

  // Tagline typing effect
  const tagline = "  ⚡  Premium WhatsApp Bot  |  Built for Power Users";
  process.stdout.write(C.cyan + C.bold);
  for (const char of tagline) {
    process.stdout.write(char);
    await sleep(18);
  }
  process.stdout.write(C.reset + "\n");

  await sleep(100);
  console.log(div);
  await sleep(100);

  // Info lines with fade-in
  const info = [
    ["  👑  Developer", "MRZEROEXPLOIT & PAYOEBOI"],
    ["  📞  Contact",   "+263780706627"],
    ["  🌐  Version",   "v2.0 PREMIUM"],
    ["  🔧  Engine",    "Baileys + Node.js " + process.version],
  ];

  for (const [label, value] of info) {
    process.stdout.write(C.gray + label + ": " + C.reset + C.white + C.bold + value + C.reset + "\n");
    await sleep(120);
  }

  await sleep(100);
  console.log(div);
  await sleep(150);

  // Loading bar
  process.stdout.write("\n" + C.gold + "  Initializing");
  for (let i = 0; i < 20; i++) {
    process.stdout.write(".");
    await sleep(60);
  }
  process.stdout.write(" " + C.green + "READY" + C.reset + "\n\n");
  await sleep(200);
}

module.exports = { showBanner };
