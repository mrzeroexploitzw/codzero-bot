const fs = require("fs-extra");
const path = require("path");
const dataDir = path.join(__dirname, "../../data");
fs.ensureDirSync(dataDir);
const blacklistFile = path.join(dataDir, "blacklist.json");
const maintFile = path.join(dataDir, "maintenance.json");

module.exports = [
  {
    name: "blacklist",
    description: "Manage bot blacklist. Usage: .blacklist add/remove <number>",
    category: "premiumadmin",
    async execute({ sock, from, args, sender, config }) {
      if (sender !== config.ownerNumber) return sock.sendMessage(from, { text: "❌ Owner only." });
      if (args.length < 2) return sock.sendMessage(from, { text: "Usage: .blacklist add/remove <number>" });
      let list = [];
      try { list = JSON.parse(fs.readFileSync(blacklistFile, "utf8") || "[]"); } catch {}
      const num = args[1].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
      if (args[0] === "add") {
        if (!list.includes(num)) list.push(num);
        await sock.sendMessage(from, { text: `🚫 Added ${args[1]} to blacklist.` });
      } else if (args[0] === "remove") {
        list = list.filter(n => n !== num);
        await sock.sendMessage(from, { text: `✅ Removed ${args[1]} from blacklist.` });
      }
      fs.writeFileSync(blacklistFile, JSON.stringify(list, null, 2));
    }
  },
  {
    name: "maintenance",
    description: "Toggle maintenance mode. Usage: .maintenance on/off",
    category: "premiumadmin",
    async execute({ sock, from, args, sender, config }) {
      if (sender !== config.ownerNumber) return sock.sendMessage(from, { text: "❌ Owner only." });
      const state = args[0] === "on";
      fs.writeFileSync(maintFile, JSON.stringify({ enabled: state }));
      await sock.sendMessage(from, { text: `🛠️ Maintenance mode ${state ? "ENABLED" : "DISABLED"}.` });
    }
  },
  {
    name: "logs",
    description: "Owner only: get recent logs",
    category: "premiumadmin",
    async execute({ sock, from, sender, config }) {
      if (sender !== config.ownerNumber) return sock.sendMessage(from, { text: "❌ Owner only." });
      await sock.sendMessage(from, { text: "ℹ️ Logs currently print to console only. Add file logging to enable this." });
    }
  },
  {
    name: "backup",
    description: "Owner only: backup session and data",
    category: "premiumadmin",
    async execute({ sock, from, sender, config }) {
      if (sender !== config.ownerNumber) return sock.sendMessage(from, { text: "❌ Owner only." });
      try {
        const archiver = require("archiver");
        const outPath = path.join(dataDir, `backup_${Date.now()}.zip`);
        const output = fs.createWriteStream(outPath);
        const archive = archiver("zip");
        archive.pipe(output);
        archive.directory("session/", "session");
        archive.directory("data/", "data");
        await archive.finalize();
        output.on("close", async () => {
          await sock.sendMessage(from, { document: fs.readFileSync(outPath), fileName: "backup.zip", mimetype: "application/zip" });
          fs.removeSync(outPath);
        });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Backup failed: " + e.message });
      }
    }
  }
];
