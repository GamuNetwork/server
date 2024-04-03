import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

import { AttachmentBuilder } from 'discord.js';
import DiscordClient from '../../discordbot/main.mjs';

import config from '../../config/Logger/logger.config.json' assert { type: "json" };


/**
 * @description Replace all \n by \n + indent
 * @param {string} str is the string you want to indent
 * @param {number} indent is the string you want to use to indent
 * @returns the indented string
 * @since 0.2.2
 * @private
 * @author Antoine Buirey
 */
function indent(str, indent){
    if(typeof str !== "string") str = str.toString();
    return str.replace(/\n/g, "\n"+"\t".repeat(indent));
}

function set_length(str, length, char = "0"){
    if(typeof str !== "string") str = str.toString();
    if(str.length > length) return str.substring(0, length);
    return char.repeat(length - str.length) + str;
}



/**
 * @module Logger
 * @category Server
 * @description This module contains the Logger class.
 * @since 1.0.0
 * @author Lila BRANDON, Antoine Buirey
 */
export default class Logger {

    static _instance = null;
    constructor() {
        if(!Logger._instance) {
            Logger._instance = this;
            this._logFolder = config.directory;
            this.use_debug = config.useDebug;
            this.discordBot = new DiscordClient();
            this.load();
            this.debug("Debug mode enabled");
            this.intervalId = setInterval(() => { //execute it at a regular interval set in server.settings
                this.load();
            }, config.refreshRate * 1000);
            this.debug("Refreshing log file every " + config.refreshRate + " seconds");
        }
        return Logger._instance;
    }
    

    /**
     * @function load
     * @description Loads the logger to prepare it for writing in log files.
     */
    load() {
        if(!fs.existsSync(config.directory)) fs.mkdirSync(config.directory);
        this.date = new Date();
        this.date = this.formatDate(this.date);
        this.filename = path.join(config.directory, this.date + ".log");

        if(this._logFile && this._logFile != this.filename){
            this.info("log file changed to " + this.filename + "\n nothing will be added in this file anymore");
        }
        this._logFile = this.filename;

        this.info("New log file created at " + this.filename);
        this.info("Logger ready to print information about the server status.");
        this.archiveOldLogs();
    }

    /**
     * @description Info function outputs a message in the current log file as a non-important information.
     * @param {string} message is the message you want to log as an info. 
     * @function
     */
    info(message) {
        if(!message) throw new Error("No message to log");
        fs.appendFileSync(this._logFile, this.date + " [INFO] " + indent(message,8) + "\n");
    }


    /**
     * @description Debug function outputs a message to help you debug your app. Only works if use_debug is set to true in settings file.
     * @param {string} message is the message you want to log as a debug.
     * @function
     */
    debug(message) {
        if(!this.use_debug) return;
        if(!message) throw new Error("No message to log");
        fs.appendFileSync(this._logFile, this.date + " [DEBUG] " + indent(message,8) + "\n");
    }


    /**
     * @description Warning function outputs a message to warn you that something may be wrong but doesn't stop the app from running
     * @param {string} message is the message you want to log as a warning
     * @function
     */
    warning(message) {
        if(!message) throw new Error("No message to log");
        fs.appendFileSync(this._logFile, this.getTimeString() + " [WARNING] " + indent(message,8) + "\n");
    }

    /**
     * @description Error function outputs a message when something is wrong and needs to be fixed quick.
     * @param {string} message is the message you want to log as an error.
     * @function
     */
    error(message) {
        if(!message) throw new Error("No message to log");
        fs.appendFileSync(this._logFile, this.getTimeString() + " [ERROR] " + indent(message,8) + "\n");
    }
    

    /**
     * @function archiveOldLogs
     * @description Archives old logs to save space.
     */
    archiveOldLogs() {
        const files = fs.readdirSync(config.directory);
        
        if(files.length <= config.maxLogFiles) {
            this.info("Number of log files is under the maximum specified in config, no archiving will be done");
            return;
        }

        const oldestFile = this.getOldestFile(files);
        const newest = this.getNewestFile(files);

        const oldestDate = this.parseDateFromFilename(oldestFile);
        const newestDate = this.parseDateFromFilename(newest);

        const zipName = this.getZipName(oldestDate, newestDate);
        const output = fs.createWriteStream(`./logs/${zipName}`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        const archivedFiles = [];

        output.on('close', () => {
            console.log(archive.pointer() + ' bytes total');
            console.log('Finished archiving logs.');
            const attachment = new AttachmentBuilder(`./logs/${zipName}`, {name: zipName});
            const channel = this.discordBot.guild.channels.cache.get('1224823809266155600');
            channel.send({files: [attachment]}).then(() => {
                console.log("Sent log archive to Discord");
                
                archivedFiles.forEach((file) => { fs.unlinkSync(`./logs/${file}`); });

                fs.unlinkSync(`./logs/${zipName}`);

                
            }).catch(console.error);
            
        });
        
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') console.warn(err);
            else throw err;
        });

        archive.on('error', function (err) { throw err; });

        for(let i = 0; i < files.length-1; i++){
            archive.file(`./logs/${files[i]}`, { name: files[i] }); 
            archivedFiles.push(files[i]);
        }

        archive.pipe(output);
        archive.finalize();
        
        
    }

    /**
     * @function
     * @description Formats a date to YYYY-MM-DD_at_HH-MM
     * @param {Date} date 
     * @returns a string version of the date
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}_at_${hours}-${minutes}`;
    }

    /**
     * @function
     * @description Parses the date from a filename in the format YYYY-MM-DD_at_HH-MM.log
     * @param {String} filename 
     * @returns a Date object
     */
    parseDateFromFilename(filename) {
        const regex = /(\d{4}-\d{2}-\d{2})_at_(\d{2})-(\d{2}).log/;
        const match = filename.match(regex);
        if (match) {
            const [, dateStr, hours, minutes] = match;
            const date = new Date(`${dateStr}T${hours}:${minutes}:00`);
            return new Date(date.getTime());
        } else throw new Error('Invalid filename format');
    }

    /**
     * @function
     * @description Gets the oldest file from the folder
     * @param {Array} files 
     * @returns the oldest file's name
     */
    getOldestFile(files) {
        let oldestFile = null;
        let oldestDate = Infinity;
    
        files.forEach(file => {
            const date = this.parseDateFromFilename(file);
            if (date < oldestDate) {
                oldestDate = date;
                oldestFile = file;
            }
        });
    
        return oldestFile;
    }

    /**
     * @function
     * @description Gets the second newest file from the folder
     * @param {Array} files 
     * @returns the second newest file's name
     */
    getNewestFile(files) {
        let newestFiles = [{file: null, date: -Infinity}, {file: null, date: -Infinity}];
    
        files.forEach(file => {
            const date = this.parseDateFromFilename(file);
            if (date > newestFiles[0].date) {
                newestFiles[1] = {file: newestFiles[0].file, date: newestFiles[0].date};
                newestFiles[0] = {file, date};
            } else if (date > newestFiles[1].date) {
                newestFiles[1] = {file, date};
            }
        });
    
        return newestFiles[1].file;
    }

    /**
     * @function
     * @description Gets the name of the zip file based on the oldest and newest dates
     * @param {Date} oldest 
     * @param {Date} newest 
     * @returns a String object representing the name of the zip file formatted to include the oldest and newest dates in the name
     */
    getZipName(oldest, newest) {
        let outputName;
    
        const format = (date) => {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${month}-${day}_at_${hours}-${minutes}`;
        };
    
        const from = format(oldest);
        const to = format(newest);
    
        if (oldest.getFullYear() !== newest.getFullYear() ||
            oldest.getMonth() !== newest.getMonth() ||
            oldest.getDate() !== newest.getDate()) {
            // If years, months, or days are not equal, use full date
            outputName = `from_${oldest.getFullYear()}-${from}_to_${newest.getFullYear()}-${to}.zip`;
        } else {
            // If all are equal, use only month, day, hour, and minute
            outputName = `from_${from}_to_${to}.zip`;
        }
        return outputName;
    }

}