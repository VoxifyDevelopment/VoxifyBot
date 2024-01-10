<div align="center">
    <img style="border-radius:50%;" src="https://avatars.githubusercontent.com/u/155932207?s=220" alt="logo">
</div>
<div align="center">
    <h1>VoxifyDevelopment - VoxifyBot</h1>
    <a href="https://discord.gg/wUXQt9hb84">
        <img src="https://img.shields.io/discord/1193746466620055672.svg?colorB=Blue&logo=discord&label=Support+%26+Community&style=for-the-badge" alt="Support">
    </a>
    <a href="https://github.com/VoxifyDevelopment/VoxifyBot/issues">
        <img src="https://img.shields.io/github/issues/VoxifyDevelopment/VoxifyBot.svg?style=for-the-badge">
    </a>
    <a href="https://www.typescriptlang.org/">
        <img src="https://img.shields.io/badge/TypeScript-grey?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://github.com/VoxifyDevelopment/VoxifyBot/releases/tag/v1.0.0">
        <img src="https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge" alt="Version">
    </a>
    <a href="https://github.com/VoxifyDevelopment/VoxifyBot/graphs/contributors">
        <img src="https://img.shields.io/github/contributors/VoxifyDevelopment/VoxifyBot.svg?style=for-the-badge" alt="Contributors">
    </a>
    <a href="https://github.com/VoxifyDevelopment/VoxifyBot/stargazers">
        <img src="https://img.shields.io/github/stars/VoxifyDevelopment/VoxifyBot.svg?style=for-the-badge" alt="Stars">
    </a>
    <a href="https://opensource.org/licenses/GPL-3.0">
        <img src="https://img.shields.io/badge/License-GPL%203.0-blue.svg?style=for-the-badge" alt="License">
    </a>
</div>

---

Elevate Discord voice channels with seamless management, multilingual support, and blazing speed for
an unparalleled user experience.

---

# Overview

## Steps to Launch the bot

### Clone Repository

> git clone
> [https://github.com/VoxifyDevelopment/VoxifyBot](https://github.com/VoxifyDevelopment/VoxifyBot)

### Download and/or update the submodules

> git submodule update --init

### Install required node modules

> npm install

---

#### Setup the development environment

- Configure the bot

  - Copy the environment file `cat .env.example > .env`
  - Open the environment file in `.env` and insert the bot token and the redis connection url
  - delete the redis connection if you don't want to enable persistent data storage for channels

- Start the bot in watch mode

  - > npm run devStart

- Start the bot without watch mode
  - > npm run dev

#### Building and Launching the bot

- Build the Bot

  - To build normal
  - > npm run build
  - To build a compact and minified version of the bot
  - > npm run build:min

- Configure the bot

  - Open the environment file in `dist/.env` and insert the bot token and the redis connection url
  - delete the redis connection if you don't want to enable persistent data storage for channels
  - you can also overwrite environment variables using command arguments
  - for example:
  - > npm start BOT*TOKEN=MTE123445.asdf.ghjk*... REDIS_CONNECTION=redis://default@127.0.0.1:6379/

- Launch the bot

  - move to `dist/` and run
  - > npm start

---

Copyright (c) 2023 - present | [voxify.dev](https://voxify.dev/) team and contributors
