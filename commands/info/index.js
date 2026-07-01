const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();

async function getRSS(url, limit = 5) {
  const { data } = await axios.get(url, { timeout: 10000 });
  const json = parser.parse(data);
  const items = json.rss?.channel?.item || json.feed?.entry || [];
  return items.slice(0, limit).map(i => i.title?.["#text"] || i.title || "Untitled");
}

module.exports = [
  {
    name: "news",
    aliases: ["headlines"],
    description: "Top world news headlines",
    category: "info",
    async execute({ sock, from }) {
      try {
        const items = await getRSS("https://feeds.bbci.co.uk/news/rss.xml");
        await sock.sendMessage(from, { text: "📰 *TOP NEWS*\n\n" + items.map((t, i) => `${i + 1}. ${t}`).join("\n") });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to fetch news: " + e.message });
      }
    }
  },
  {
    name: "technews",
    aliases: ["tech"],
    description: "Top tech news headlines",
    category: "info",
    async execute({ sock, from }) {
      try {
        const items = await getRSS("https://feeds.feedburner.com/TechCrunch/");
        await sock.sendMessage(from, { text: "💻 *TECH NEWS*\n\n" + items.map((t, i) => `${i + 1}. ${t}`).join("\n") });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to fetch tech news: " + e.message });
      }
    }
  },
  {
    name: "sportsnews",
    aliases: ["sports"],
    description: "Top sports news headlines",
    category: "info",
    async execute({ sock, from }) {
      try {
        const items = await getRSS("https://www.espn.com/espn/rss/news");
        await sock.sendMessage(from, { text: "⚽ *SPORTS NEWS*\n\n" + items.map((t, i) => `${i + 1}. ${t}`).join("\n") });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to fetch sports news: " + e.message });
      }
    }
  },
  {
    name: "trending",
    aliases: ["popular"],
    description: "Trending topics on Reddit",
    category: "info",
    async execute({ sock, from }) {
      try {
        const { data } = await axios.get("https://www.reddit.com/r/popular.json?limit=8&raw_json=1", {
          headers: { "User-Agent": "codzero-bot/1.0" }
        });
        const posts = data.data.children.map((p, i) => `${i + 1}. ${p.data.title} (r/${p.data.subreddit})`);
        await sock.sendMessage(from, { text: "🔥 *TRENDING NOW*\n\n" + posts.join("\n") });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Failed to fetch trending: " + e.message });
      }
    }
  },
  {
    name: "wiki",
    aliases: ["wikipedia"],
    description: "Wikipedia summary. Usage: .wiki <topic>",
    category: "info",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .wiki <topic>" });
      try {
        const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args.join(" "))}`);
        await sock.sendMessage(from, { text: `📖 *${data.title}*\n\n${data.extract}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Topic not found." });
      }
    }
  }
];
