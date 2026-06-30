# CODZERO WhatsApp Bot

Developer: **MRZEROEXPLOIT & PAYOEBOI**
Contact: **+263780706627**
Email: **mrzeroexploit@gmail.com**

## What this is

A WhatsApp automation bot built on [Baileys](https://github.com/WhiskeySockets/Baileys), an open-source
library that connects to WhatsApp the same way WhatsApp Web does. It is **not an official WhatsApp Bot API
product** — there isn't one for personal numbers. Read the "Ban risk" section before linking your main number.

## Setup (Termux)

```bash
pkg install nano -y
nano install.sh        # paste install.sh content, CTRL+O to save, CTRL+X to exit
bash install.sh
```

Then write the source files (commands, config, index.js, lib/db.js — see project structure below) into
`~/codzero-bot/` exactly as provided, preserving folder paths.

```bash
cd ~/codzero-bot
node index.js
```

On first run you'll be asked for your phone number (with country code, no `+`). The bot will print an
**8-character pairing code**. On your phone: **WhatsApp → Settings → Linked Devices → Link a Device →
Link with phone number instead**, then type the code. This is WhatsApp's own official pairing mechanism —
nothing is being faked or intercepted.

## Keeping it running

```bash
termux-wake-lock        # stop Android from killing Termux
bash autorun.sh          # auto-restarts the bot if it crashes
```

True 24/7 uptime from a phone is unreliable (Android will still throttle background apps eventually). If you
need real 24/7 uptime, move the same `~/codzero-bot` folder to a cheap VPS and run it there with `pm2` instead
of `autorun.sh`.

## Project structure

```
codzero-bot/
├── index.js              # main entry, connection + message routing
├── config.js              # bot name, owner numbers, prefix, feature defaults
├── autorun.sh              # crash-resilient launcher
├── package.json
├── lib/
│   └── db.js              # JSON-file storage for group settings/warnings
├── commands/
│   ├── core/index.js      # ping, uptime, mode, restart, broadcast, setpp, setbio, eval
│   ├── group/index.js     # kick, promote, demote, tagall, antilink, antispam, welcome, bye, setgdesc, lockgroup
│   ├── utility/index.js   # quote, sticker, toimg, define, calc, translate, shorturl, qr
│   └── fun/index.js       # menu, owner, about, runtime, speed, joke, meme, credits
├── data/                  # auto-created JSON data files
├── session/                # auto-created WhatsApp auth session — back this up, don't share it
└── media/
```

## First things to do after pairing

1. Edit `config.js` → confirm `ownerNumbers` has your number in the format `2637xxxxxxx@s.whatsapp.net`.
2. Send `.setpp` (replying to an image) in any chat with the bot to set its profile picture.
3. Send `.setbio Your status text` to set the About text.
4. Send `.menu` to confirm all 35 commands loaded.

## Ban risk — read this honestly

WhatsApp's Terms of Service do not permit automating a personal account this way. Baileys-based bots are
widely used, but WhatsApp does detect and ban accounts that behave automatically (rapid responses, mass
messaging, joining/leaving groups quickly, broadcasting to many groups). Things that genuinely reduce risk:

- Use a **separate number**, not your primary personal/business number.
- Don't broadcast to many groups back-to-back (the `.broadcast` command already throttles 1.5s between sends — don't lower that).
- Don't auto-join or scrape groups.
- Avoid sending identical text to many chats in a short window.
- Expect that an account *can* still be banned regardless of these precautions — there is no guaranteed-safe
  configuration, no matter what other bot projects claim. "Antiban" code reduces detection signals; it does
  not make automation compliant with WhatsApp's rules.

## Default behaviors

- **Antilink**: off by default per group, enable with `.antilink on`. Deletes links from non-admins, removes
  the member after 2 warnings.
- **Antispam**: off by default, enable with `.antispam on`. Mutes (deletes messages from) a user for 60s if
  they send more than 6 messages in 10 seconds.
- **Mode**: public by default — anyone can use non-owner commands. Switch to `.mode private` to restrict
  everything to the owner number(s) in `config.js`.

## Adding more commands

Add a new object to the array in the relevant `commands/<category>/index.js` file following the existing
shape (`name`, `aliases`, `description`, `category`, `execute`). No other wiring needed — `index.js` picks
up everything in those four arrays automatically.
