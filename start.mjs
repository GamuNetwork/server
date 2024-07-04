// SERVER IMPORTS

import { Settings } from '#modules/settings/main.mjs';

// DotEnv to read .env file
import dotenv from 'dotenv';
dotenv.config();

import { info, warning, Logger } from '@gamunetwork/logger';

// Logger to log the server activity
import LoggerConfig from '#modules/logger/main.mjs';
new LoggerConfig();

// Discord Bot to handle some archiving and further features
import DiscordClient from './discordbot/main.mjs';
if(process.env.DISCORD_TOKEN != undefined) {
    const discordBot = new DiscordClient();
    discordBot.login(process.env.DISCORD_TOKEN);
    info("Discord bot started");
}
else{
    warning("No Discord token provided, Artifacts will not be archived.");
}

// ServerWebApp to handle the web server
import ServerWebApp from '#modules/webserverapp/main.mjs';

const server = new ServerWebApp();
server.listen();
