import http from 'http';
import express from 'express';

import { Logger, debug, info, error, critical, warning, deepDebug, COLORS } from '@gamunetwork/logger';

import config from '../../config/WebServerApp/webserverapp.config.json' assert { type: "json" };

import { handleRedirectAny } from '../appRequests/redirectRequests.mjs';

Logger.setModule("WebServer");

/**
 * @class ServerWebApp
 * @description Main class of the server's web application
 * Handles requests to the server.
 * @version 1.0
 * @since 1.0
 */
export default class ServerWebApp {

    static _instance = null;
    constructor() {
        if(!ServerWebApp._instance) {
            ServerWebApp._instance = this;
            // initialize the server
            this.app = express();
            this.server = http.createServer(this.app);

            // handle requests
            this.app.get('/', (req, res) => { handleRedirectAny(req, res); });
        }
        return ServerWebApp._instance;
    }

    listen() {
        this.server.listen(config.port, () => {
            info(`Server running on port ${config.port}`);
            // logger.info('http server opened, listening on *:'+server.address().port);
        });
    }


}
