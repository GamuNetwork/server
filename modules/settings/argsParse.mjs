import { ArgumentParser } from 'argparse';
import fs from 'fs';

const version = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version;

function configParser(parser){
    parser.add_argument('-v', '--version', { action: 'version', version });
    parser.add_argument('-f', '--config-file', { help: "the config file to use" });

    const loggerSettingsGroup = parser.add_argument_group('Logger settings');
    loggerSettingsGroup.add_argument('--logger.directory', { help: 'the directory to store logs in', type: 'str' });
    loggerSettingsGroup.add_argument('--logger.max-log-files', { help: 'the maximum number of log files to keep', type: 'int' });
    loggerSettingsGroup.add_argument('--logger.refresh-rate', { help: 'the rate at which to refresh the logs', type: 'int' });
    loggerSettingsGroup.add_argument('--logger.level', { help: 'the level of logging to use', type: 'str', choices: ['deep_debug', 'debug', 'info', 'warning', 'error', 'critical'] });

    const webServerSettingsGroup = parser.add_argument_group('Web server settings');
    webServerSettingsGroup.add_argument('--webserver.port', { help: 'the port to listen on', type: 'int' });
}


function parseArguments(parser){
    let args = parser.parse_args();
    let result = {};
    for (const [key, value] of Object.entries(args)) {
        if (value !== undefined) {
            let keyTokens = key.split(".");
            let current = result;
            for (let i = 0; i < keyTokens.length - 1; i++) {
                if (!current[keyTokens[i]]) {
                    current[keyTokens[i]] = {};
                }
                current = current[keyTokens[i]];
            }
            current[keyTokens[keyTokens.length - 1]] = value;
        }
    }

    return result;
}

const parser = new ArgumentParser({
    description: 'A simple argument parser',
});

configParser(parser);
const commandLineArguments = parseArguments(parser);

export { commandLineArguments };
