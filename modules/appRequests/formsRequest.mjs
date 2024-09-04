import { MongoClient } from "mongodb";
import { Logger } from "@gamunetwork/logger";

import { generateUUID } from "#modules/utils/main.mjs";

async function getDatabaseConnection() {
    // Il faudra penser à mettre ça en variable d'environnement
    const dbUsername = "GamuClient"
    const dbPassword = encodeURIComponent("Kn8_#sE@az378")
    const uri = `mongodb://${dbUsername}:${dbPassword}@vps.gamunetwork.com:27017/GamuNetwork`
    const client = new MongoClient(uri);
    await client.connect();
    return client.db("GamuNetwork");
}

export async function handleRedirectRegister(req, res) {

    await getDatabaseConnection().then(database => {
        Logger.debug("Connected to the database while trying to register a new user");
        
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        const uuid = generateUUID();
    
        database.collection("players").insertOne({ uuid: uuid, username: username, password: password, email: email, friends: [] });
    });

    return res.send({status: "success", token: "token"});
}

export async function handleRedirectLogin(req, res) {
    return res.send('Login');
}

export async function handleRedirectForgotPassword(req, res) {
    return res.send('Forgot Password');
}