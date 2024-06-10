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
            this.app.post('/register', (req, res) => { handleRedirectRegister(req, res); });
        }
        return ServerWebApp._instance;
    }

    listen() {
        this.server.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
            
            const io = new Server({
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });
            io.listen(3001);

            io.on('connection', (socket) => {
                console.log('a user connected');
                socket.on('disconnect', () => {
                    console.log('user disconnected');
                });

                socket.on('message', (message) => {
                    console.log('Got message: ', message);
                    socket.emit('message', 'Received ' + message);
                });

            });

            

        });
    }


}
