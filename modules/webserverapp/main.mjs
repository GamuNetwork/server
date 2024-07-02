import http from 'http';
import express from 'express';

import { Logger, COLORS } from '@gamunetwork/logger';

import { Settings } from '#modules/settings/main.mjs';

import { handleRedirectAny } from '../appRequests/redirectRequests.mjs';

import { Server } from "socket.io";
// import { handleRedirectRegister } from '../appRequests/formsRequest.mjs'; //TODO missing file appRequests/formsRequest.mjs

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
        Logger.debug("Initialization completed");
        return ServerWebApp._instance;
    }

    listen() {
        this.server.listen(Settings.get('webServer.port'), () => {
            Logger.info(`Server running on port ${Settings.get('webServer.port')}`);
            
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
