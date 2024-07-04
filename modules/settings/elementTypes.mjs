import { LEVELS } from "@gamunetwork/logger";

/*
 * the following table map the key of the setting to the function that will convert the string value to the correct type
 * for example, if the key is "logger.level", the value will be converted using LEVELS.fromString
 * when getting the value from the settings using Settings.get(key), the type of the value will be the same as the one returned
 * by the function in the table
 * If no type are specified, the value will be returned as the one defined in the default config file and the command line arguments
*/

const elementTypes = {
    "logger.level": LEVELS.fromString
};

export { elementTypes };