const axios = require("axios");

module.exports = [
  {
    name: "weather",
    description: "Get weather for a city. Usage: .weather <city>",
    category: "utility2",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .weather <city>" });
      try {
        const city = args.join(" ");
        const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
        const loc = geo.data.results?.[0];
        if (!loc) return sock.sendMessage(from, { text: "❌ City not found." });
        const w = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true`);
        const c = w.data.current_weather;
        const text = `🌦️ *WEATHER: ${loc.name}, ${loc.country}*\n\nTemp: ${c.temperature}°C\nWind: ${c.windspeed} km/h\nWind Dir: ${c.winddirection}°`;
        await sock.sendMessage(from, { text });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Weather lookup failed: " + e.message });
      }
    }
  },
  {
    name: "time",
    aliases: ["worldtime"],
    description: "Get current time for a timezone. Usage: .time <Area/City e.g. Africa/Harare>",
    category: "utility2",
    async execute({ sock, from, args }) {
      if (!args.length) return sock.sendMessage(from, { text: "Usage: .time Africa/Harare" });
      try {
        const { data } = await axios.get(`https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(args[0])}`);
        const text = `🕒 *TIME: ${args[0]}*\n\n${data.dateTime}\n${data.dayOfWeek}`;
        await sock.sendMessage(from, { text });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Invalid timezone. Example: Africa/Harare" });
      }
    }
  },
  {
    name: "currency",
    aliases: ["convert", "rate"],
    description: "Convert currency. Usage: .currency <amount> <from> <to>",
    category: "utility2",
    async execute({ sock, from, args }) {
      if (args.length < 3) return sock.sendMessage(from, { text: "Usage: .currency 100 USD ZWL" });
      const [amt, fromC, toC] = args;
      try {
        const { data } = await axios.get(`https://api.exchangerate.host/convert?from=${fromC.toUpperCase()}&to=${toC.toUpperCase()}&amount=${amt}`);
        if (!data.result) return sock.sendMessage(from, { text: "❌ Conversion failed, check currency codes." });
        await sock.sendMessage(from, { text: `💱 ${amt} ${fromC.toUpperCase()} = ${data.result.toFixed(2)} ${toC.toUpperCase()}` });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Currency conversion failed: " + e.message });
      }
    }
  }
];
