import { mergeDicts } from "./utils.mjs";
import { commandLineArguments } from "./argsParse.mjs";
import fs from 'fs';

const defaultConfigFilePath = "./config/default.config.json";

class _Settings{
    constructor(){
        this._config = JSON.parse(fs.readFileSync(defaultConfigFilePath, 'utf-8'));
        if(commandLineArguments.config_file){
            try{
                let customConfig = JSON.parse(fs.readFileSync(commandLineArguments.config_file, 'utf-8'));
                this.#mergeConfig(customConfig);
                delete commandLineArguments.config_file;
            }
            catch(e){
                console.error("Error reading custom config file: " + e);
            }
        }
        
        this.#mergeConfig(commandLineArguments);
    }

    #mergeConfig(config){
        mergeDicts(this._config, config);
    }

    // allow syntax like `Settings.get("logger.directory")`
    get(key){
        let keyTokens = key.split(".");
        let current = this._config;
        for (let i = 0; i < keyTokens.length; i++) {
            if (!current[keyTokens[i]]) {
                throw new Error("Key not found in settings: " + key);
            }
            current = current[keyTokens[i]];
        }
        return current;
    }
}

const Settings = new _Settings();

export { Settings };
