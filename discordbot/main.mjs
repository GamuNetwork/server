import Discord from 'discord.js';
import Logger from '#modules/logger/main.mjs';

export default class DiscordClient {

    static _instance = null;
    #client = null;
    constructor() {
        if(!DiscordClient._instance) {
            DiscordClient._instance = this;
            this.#client = new Discord.Client({
                intents: [
                    Discord.IntentsBitField.Flags.Guilds,
                    Discord.IntentsBitField.Flags.GuildMessages,
                    Discord.IntentsBitField.Flags.GuildMembers
                ]
            });

            this.#client.on('ready', () => { this.onReady(); });

        }
        return DiscordClient._instance;
    }

    
    async onReady() {
        console.log(`Discord bot logged in as ${this.#client.user.tag}!`);
        this._guild = await this.#client.guilds.fetch("1223995903342411796");
        this.logger = new Logger();
    }
    
    login(TOKEN) { 
        this.#client.login(TOKEN); 
    }
    
    get client() { return this.#client; }
    get guild() { return this._guild; }
}
