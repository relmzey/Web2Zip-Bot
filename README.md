<div align="center">

# Web2Zip Bot

A focused Discord bot that downloads public website frontends and packages them
into ZIP archives.

[![Discord](https://img.shields.io/badge/Discord-Web2Zip-5865F2?logo=discord&logoColor=white)](https://discord.gg/AeroX)

</div>

---

## Overview

Web2Zip Bot turns a public website URL into a downloadable frontend snapshot
directly inside Discord. It fetches the initial HTML, discovers referenced
frontend resources, rewrites remote asset paths to local files, and returns a
ZIP archive in the same public Discord response.

The bot is designed for transparent, static frontend packaging. It does not
attempt to access private systems, bypass authentication, or copy server-side
application logic.

---

## Features

### Website Frontend Packaging

Create an archive from a public website with one slash command.

- Use `/clone url:<public URL>`
- Fetch the initial HTML document
- Discover assets referenced by HTML, CSS, and JavaScript files
- Download public CSS, JavaScript, images, fonts, SVG, and JSON resources
- Rewrite remote references to local `assets/` paths
- Generate a README inside every archive
- Attach the completed ZIP to the original public Discord response

### Discord Commands

- `/clone` — package a public website frontend into a ZIP archive
- `/help` — show usage, included files, and limits
- `/about` — show bot information

Responses use clean white embeds with the requesting user's Discord avatar and
username displayed as the embed author.

### Safety and Limits

- Public HTTP(S) websites only
- Private networks, localhost, and authenticated URLs are rejected
- Custom ports are not supported
- Main page limit: **3 MB**
- Individual asset limit: **2 MB**
- Maximum resources per clone: **80**
- Maximum ZIP size: **7.5 MB**
- Temporary working files are removed after each request

### Health Monitoring

The bot includes a lightweight HTTP server for hosting providers and uptime
checks.

```text
GET /api/healthz
```

Successful responses return:

```json
{
  "status": "ok"
}
```

---

## What It Copies

The archive can contain:

- The page's HTML
- Public CSS files
- Browser JavaScript files
- Images and SVG files
- Public web fonts
- JSON and other referenced text assets
- A generated archive README

The result is a static frontend snapshot. A copied site may not work fully if
it depends on a backend API, authentication, database, server-rendered
content, or JavaScript behavior that requires a real browser environment.

## What It Does Not Copy

Web2Zip Bot does not copy or bypass:

- Logins or private content
- Server-side code
- Databases
- User accounts or sessions
- Payment systems
- Paywalls
- Protected or authenticated APIs
- Private networks

Only use the bot with websites and content you have permission to download.

---

## Setup

### Requirements

- Node.js 20 or newer
- A Discord application with a bot user
- The `bot` and `applications.commands` OAuth scopes
- A Discord bot token
- The Discord application/client ID

### Installation

```bash
# Clone the repository
git clone https://github.com/AeroXDevs/Web2Zip-Bot.git
cd Web2Zip-Bot

# Install dependencies
npm install
```

### Configuration

Open `src/config.js` and enter your Discord application values directly:

```js
const config = {
  discordToken: "your-discord-bot-token",
  discordClientId: "your-discord-application-id",
  port: 5000,
};
```

Keep `src/config.js` private and never commit real credentials to a public
repository. The bot token is a credential and should be regenerated immediately
if it is ever exposed.

### Start

```bash
npm start
```

For local development with Node's file watcher:

```bash
npm run dev
```

The bot registers its slash commands when it starts and the HTTP health server
listens on the configured `PORT`.

---

## Project Structure

```text
src/
├── index.js                    Application entry point
├── config.js                   Discord credentials and bot configuration
├── logger.js                   Structured application logging
├── server.js                   HTTP health server
├── bot/
│   ├── create-client.js        Discord client and command registration
│   └── commands.js              Slash commands and interaction responses
├── services/
│   ├── website-cloner.js       Website crawl orchestration
│   ├── resource-fetcher.js     Bounded HTTP resource downloads
│   ├── asset-parser.js         Frontend reference discovery and rewriting
│   └── archive-builder.js      ZIP archive creation
└── utils/
    ├── url.js                  Public URL and network safety checks
    └── files.js                Safe names, extensions, and asset helpers
```

---

## Credits

**Developer** — [itsfizys (Aegis)](https://github.com/itsfizys)  
**Organization** — [AeroX Development](https://github.com/AeroXDevs)

---

## Support

For questions, permissions, bug reports, or support, join the AeroX
Development Discord community:

**[discord.gg/AeroX](https://discord.gg/AeroX)**

---

<div align="center">

© 2026 itsfizys (Aegis) — AeroX Development. All rights reserved.  
See [LICENSE](./LICENSE) for usage terms.

</div>