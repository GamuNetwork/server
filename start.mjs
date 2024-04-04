// SERVER IMPORTS

// DotEnv to read .env file
import dotenv from 'dotenv';
dotenv.config();

// Discord Bot to handle some archiving and further features
import DiscordClient from './discordbot/main.mjs';
const discordBot = new DiscordClient();
discordBot.login(process.env.DISCORD_TOKEN);

// ServerWebApp to handle the web server
import ServerWebApp from './modules/webserverapp/main.mjs';

// Logger to log the server activity
import Logger from './modules/logger/main.mjs';


const server = new ServerWebApp();
server.listen();
