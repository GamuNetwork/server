import Discord from 'discord.js';
import Logger from '../modules/logger/main.mjs';

// import { REST, Routes } from 'discord.js';

// const commands = [
//   {
//     name: 'ping',
//     description: 'Replies with Pong!',
//   },
// ];

// const rest = new REST({ version: '10' }).setToken("MTIyNDgxMDQ1NjQyMjU0NzU4Nw.GKO6rl.WRhOalP40bd6EDzPKsxUCljMS31HDb4v-HJb68");

// try {
//     console.log('Started refreshing application (/) commands.');
  
//     await rest.put(Routes.applicationCommands("1224810456422547587"), { body: commands });
  
//     console.log('Successfully reloaded application (/) commands.');
//   } catch (error) {
//     console.error(error);
//   }

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
            // this.client.on('interactionCreate', async interaction => {
            //     if (!interaction.isChatInputCommand()) return;
              
            //     if (interaction.commandName === 'ping') {
            //         const attachment = new AttachmentBuilder('./github_logo.png', {name: 'github_logo.png'});
            //         await interaction.reply({files: [attachment]});
            //     }
            // });

        }
        return DiscordClient._instance;
    }

    
    async onReady() {
        console.log(`Discord bot logged in as ${this.#client.user.tag}!`);
        this._guild = await this.#client.guilds.fetch("1223995903342411796");
        this.logger = new Logger();
    }
    
    onMessage(message) {
        if (message.author.bot) return;
        if (message.content === 'ping') {
            message.reply('chut');
            message.channel.send(new Discord.Attachment('/github_logo.png', 'github_logo.png'))
            .then(msg => {
                
            })
            .catch(console.error);
            return;
        }
    }
    
    login(TOKEN) { 
        this.#client.login(TOKEN); 
    }
    
    get client() { return this.#client; }
    get guild() { return this._guild; }
}
