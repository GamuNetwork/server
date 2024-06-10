import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

import { AttachmentBuilder } from 'discord.js';
import DiscordClient from '../../discordbot/main.mjs';

import { Logger, debug, info, error, critical, warning, deepDebug, COLORS, LEVELS } from '@gamunetwork/logger';

import config from '#config/Logger/logger.config.mjs';

Logger.setModule("Logger");

/**
 * @module Logger
 * @category Server
 * @description This module contains the Logger class.
 * @since 1.0.0
 * @author Lila BRANDON, Antoine Buirey
 */
export default class LoggerWrapper {

    static _instance = null;
    constructor() {
        if(!LoggerWrapper._instance) {
            LoggerWrapper._instance = this;
            this._logFolder = config.directory;

            this._logFile = path.join(this._logFolder, LoggerWrapper.formatDate(new Date()) + ".log");
            Logger.setTarget(this._logFile.toString());
            
            Logger.setLevel(config.level);
            debug("Logger initialized with log level " + LEVELS.name(config.level));

            this.discordBot = new DiscordClient();
            this.load();
            
            this.intervalId = setInterval(() => { //execute it at a regular interval set in server.settings
                this.load();
            }, config.refreshRate * 1000);
            debug("Refreshing log file every " + config.refreshRate + " seconds");
            
            info("initializaion complete with log level " + LEVELS.name(config.level));
        }
        return LoggerWrapper._instance;
    }
    

    /**
     * @function load
     * @description Loads the logger to prepare it for writing in log files.
     */
    load() {
        if(!fs.existsSync(this._logFolder)) fs.mkdirSync(this._logFolder);
        this.date = new Date();
        this.date = LoggerWrapper.formatDate(this.date);
        this.filename = path.join(this._logFolder, this.date + ".log");

        if(this._logFile && this._logFile != this.filename){// change log file
            let oldFile = this._logFile;
            Logger.info("log file changed to " + this.filename + "\nnothing will be added in this file anymore", COLORS.YELLOW);
            this._logFile = this.filename;
            Logger.setTarget(this._logFile);
            Logger.info("this file follow the previous one : " + oldFile, COLORS.YELLOW);
        }
        this.archiveOldLogs();
    }

    /**
     * @function archiveOldLogs
     * @description Archives old logs to save space.
     */
    archiveOldLogs() {
        const files = fs.readdirSync(this._logFolder);
        
        if(files.length <= config.maxLogFiles) {
            debug("Number of log files is under the maximum specified in config, no archiving will be done");
            return;
        }

        const oldestFile = LoggerWrapper.getOldestFile(files);
        const newest = LoggerWrapper.getNewestFile(files);

        const oldestDate = LoggerWrapper.parseDateFromFilename(oldestFile);
        const newestDate = LoggerWrapper.parseDateFromFilename(newest);

        const zipName = LoggerWrapper.getZipName(oldestDate, newestDate);
        const output = fs.createWriteStream(`./logs/${zipName}`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        const archivedFiles = [];

        output.on('close', () => {
            debug(archive.pointer() + ' bytes total');
            debug('Finished archiving logs.');
            const attachment = new AttachmentBuilder(`./logs/${zipName}`, {name: zipName});
            const channel = this.discordBot.guild.channels.cache.get('1224823809266155600');
            channel.send({files: [attachment]}).then(() => {
                info("Logs files sent archive to Discord");
                
                archivedFiles.forEach((file) => { fs.unlinkSync(`./logs/${file}`); });

                fs.unlinkSync(`./logs/${zipName}`);

                
            }).catch(console.error);
            
        });
        
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') warning(err);
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
    static formatDate(date) {
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
    static parseDateFromFilename(filename) {
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
    static getOldestFile(files) {
        let oldestFile = null;
        let oldestDate = Infinity;
    
        files.forEach(file => {
            const date = LoggerWrapper.parseDateFromFilename(file);
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
    static getNewestFile(files) {
        let newestFiles = [{file: null, date: -Infinity}, {file: null, date: -Infinity}];
    
        files.forEach(file => {
            const date = LoggerWrapper.parseDateFromFilename(file);
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
    static getZipName(oldest, newest) {
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