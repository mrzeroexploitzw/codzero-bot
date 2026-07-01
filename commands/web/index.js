const axios = require("axios");
const tls = require("tls");
const os = require("os");

module.exports = [
  {
    name: "ipinfo",
    aliases: ["iplookup"],
    description: "IP address lookup. Usage: .ipinfo <ip>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .ipinfo <ip>" });
      try {
        const { data } = await axios.get(`http://ip-api.com/json/${args[0]}`);
        if (data.status === "fail") return sock.sendMessage(from, { text: "❌ Invalid IP." });
        await sock.sendMessage(from, { text: `🌐 *IP INFO*\n\nIP: ${data.query}\nCountry: ${data.country}\nCity: ${data.city}\nISP: ${data.isp}\nTimezone: ${data.timezone}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Lookup failed: " + e.message });
      }
    }
  },
  {
    name: "dns",
    aliases: ["dnslookup"],
    description: "DNS lookup. Usage: .dns <domain>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .dns <domain>" });
      try {
        const { data } = await axios.get(`https://dns.google/resolve?name=${args[0]}&type=A`);
        if (!data.Answer) return sock.sendMessage(from, { text: "❌ No records found." });
        const records = data.Answer.map(r => `${r.name} → ${r.data} (TTL ${r.TTL})`).join("\n");
        await sock.sendMessage(from, { text: `🧭 *DNS: ${args[0]}*\n\n${records}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ DNS lookup failed: " + e.message });
      }
    }
  },
  {
    name: "whois",
    description: "Domain WHOIS lookup. Usage: .whois <domain>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .whois <domain>" });
      try {
        const { data } = await axios.get(`https://rdap.org/domain/${args[0]}`);
        const events = (data.events || []).map(e => `${e.eventAction}: ${e.eventDate}`).join("\n");
        await sock.sendMessage(from, { text: `📋 *WHOIS: ${data.ldhName || args[0]}*\n\nStatus: ${(data.status || []).join(", ")}\n${events}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ WHOIS failed or domain not found." });
      }
    }
  },
  {
    name: "ping",
    aliases: ["siteup"],
    description: "Check if a site is up. Usage: .ping <url>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .ping <url>" });
      let url = args[0];
      if (!/^https?:\/\//.test(url)) url = "https://" + url;
      const start = Date.now();
      try {
        const res = await axios.head(url, { timeout: 8000, validateStatus: () => true });
        await sock.sendMessage(from, { text: `✅ *${url}* is UP\nStatus: ${res.status}\nResponse: ${Date.now() - start}ms` });
      } catch (e) {
        await sock.sendMessage(from, { text: `❌ *${url}* appears DOWN.` });
      }
    }
  },
  {
    name: "ssl",
    aliases: ["sslcheck"],
    description: "Check SSL cert expiry. Usage: .ssl <domain>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .ssl <domain>" });
      const host = args[0].replace(/^https?:\/\//, "").split("/")[0];
      try {
        const cert = await new Promise((resolve, reject) => {
          const socket = tls.connect(443, host, { servername: host, timeout: 8000 }, () => {
            resolve(socket.getPeerCertificate());
            socket.end();
          });
          socket.on("error", reject);
          socket.on("timeout", () => reject(new Error("timeout")));
        });
        if (!cert?.valid_to) return sock.sendMessage(from, { text: "❌ Could not retrieve cert." });
        await sock.sendMessage(from, { text: `🔒 *SSL: ${host}*\n\nIssuer: ${cert.issuer?.O || "Unknown"}\nValid From: ${cert.valid_from}\nValid To: ${cert.valid_to}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ SSL check failed: " + e.message });
      }
    }
  },
  {
    name: "headers",
    description: "Fetch HTTP headers. Usage: .headers <url>",
    category: "web",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .headers <url>" });
      let url = args[0];
      if (!/^https?:\/\//.test(url)) url = "https://" + url;
      try {
        const res = await axios.head(url, { timeout: 8000, validateStatus: () => true });
        const text = Object.entries(res.headers).map(([k, v]) => `${k}: ${v}`).join("\n");
        await sock.sendMessage(from, { text: `📑 *HEADERS: ${url}*\n\n${text}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed: " + e.message });
      }
    }
  },
  {
    name: "botinfo",
    aliases: ["mybot"],
    description: "Show bot system info",
    category: "web",
    async execute({ sock, from }) {
      const text = `🤖 *BOT INFO*\n\nPlatform: ${os.platform()}\nArch: ${os.arch()}\nCPU Cores: ${os.cpus().length}\nFree RAM: ${(os.freemem() / 1024 / 1024).toFixed(0)}MB\nTotal RAM: ${(os.totalmem() / 1024 / 1024).toFixed(0)}MB\nNode: ${process.version}`;
      await sock.sendMessage(from, { text });
    }
  },
  {
    name: "useragent",
    aliases: ["ua"],
    description: "Random user-agent string",
    category: "web",
    async execute({ sock, from }) {
      const list = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
      ];
      await sock.sendMessage(from, { text: `🕵️ *Random UA:*\n\n${list[Math.floor(Math.random() * list.length)]}` });
    }
  }
];
