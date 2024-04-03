// SERVER IMPORTS

// DotEnv to read .env file
import dotenv from 'dotenv';
dotenv.config();


import ServerWebApp from './modules/webserverapp/main.mjs';
import DiscordClient from './discordbot/main.mjs';
import Logger from './modules/logger/main.mjs';

const discordBot = new DiscordClient();
discordBot.login(process.env.DISCORD_TOKEN);

const server = new ServerWebApp();
server.listen();
