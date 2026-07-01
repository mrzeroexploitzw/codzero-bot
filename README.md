# ⚡ CODZERO BOT

> Premium WhatsApp Bot | Built for Power Users


---

## ✨ Features

- 🎨 Animated Premium Banner with colored startup screen
- 🔗 Pairing Code Auth — no QR scanning needed
- 📰 News and Info — BBC, tech, sports, Wikipedia, Hacker News
- 🌐 Web and Network Tools — IP lookup, DNS, WHOIS, SSL, ping
- 🌦️ Utility — weather, time zones, currency converter
- 🎮 Games and Fun — dice game, 8ball, coinflip, jokes, facts, polls
- 🖼️ Media Tools — sticker, QR generate/read, TTS
- 👥 Group Management — kick, promote, warn system, antilink, antispam, welcome/bye
- 👑 Premium Admin — blacklist, maintenance mode, backup, mute/unmute
- 🔄 Auto Reconnect — retries indefinitely when internet drops

---

## 🚀 Quick Install

### Termux (Android)

```bash
pkg update && pkg upgrade -y
pkg install git nodejs npm -y
git clone https://github.com/mrzeroexploitzw/codzero-bot.git
cd codzero-bot
npm install
node index.js
```

### Linux / VPS

```bash
apt update && apt install -y git nodejs npm
git clone https://github.com/mrzeroexploitzw/codzero-bot.git
cd codzero-bot
npm install
node index.js
```

---

## ⚙️ Configuration

Edit config.js and set your details:

```js
ownerNumbers: ['263XXXXXXXXX@s.whatsapp.net'],
botName: 'CODZERO',
prefix: '.',
```

---

## 📚 Commands (109+ aliases)

| Category | Commands |
|----------|----------|
| ⚙️ Core | .ping .uptime .mode .restart .broadcast .setpp .setbio .eval |
| 📰 Info | .news .technews .sportsnews .trending .wiki |
| 🌐 Web | .ipinfo .dns .whois .ping .ssl .headers .botinfo .useragent |
| 🌦️ Utility | .weather .time .currency .sticker .toimg .qr .calc .translate .shorturl .define |
| 🎮 Toys | .dice .8ball .coinflip .fact .joke .poll .remindme |
| 🎵 Media | .tts .qrread |
| 👥 Group | .kick .promote .demote .tagall .warn .antilink .antispam .welcome .bye .mute .unmute .setname .groupinfo .resetlink .groupjid .setgdesc .lockgroup |
| 👑 Admin | .blacklist .maintenance .backup .logs |

---

## 🔄 Run 24/7 with PM2

```bash
npm install -g pm2
pm2 start index.js --name codzero
pm2 save
termux-wake-lock
```

---

## ⚠️ Disclaimer

This bot uses Baileys, an unofficial WhatsApp library. Use a separate number not your main number. The developers are not responsible for banned accounts.

---

Developer: MRZEROEXPLOIT & PAYOEBOI
Contact: +263780706627
