import { MongoClient } from "mongodb";
import jwt from 'jsonwebtoken';
import { Logger } from "@gamunetwork/logger";

import { generateUUID, hashPassword, verifyPassword } from "#modules/utils/main.mjs";

const JWT_SECRET = process.env.JWT_SECRET || 'GamuBackUp_#JtW9595Sec3rrt'; // Stocker dans les variables d'environnement

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

    await getDatabaseConnection().then(async database => {
        Logger.debug("Connected to the database while trying to register a new user");
        
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        const uuid = generateUUID();
        const hashedPassword = await hashPassword(plainPassword);
    
        database.collection("players").insertOne({ uuid: uuid, username: username, password: hashedPassword, email: email, friends: [] });
        
        const token = jwt.sign(
            { uuid: uuid, username: username }, // Payload
            JWT_SECRET,                         // Secret
            { expiresIn: '24h' }                // Expiration (1 heure ici)
        );
        
        return res.send({status: "success", token: token});
    
    });

    return res.send({status: "error", message: "An error occured while trying to register a new user"});
}

export async function handleRedirectLogin(req, res) {
    try {
        await getDatabaseConnection().then(async database => {
            const players = database.collection('players');
            const user = await players.findOne({ email: req.body.email });

        });

        // Trouver l'utilisateur

        if (user) {
            // Vérifier le mot de passe
            const match = await verifyPassword(plainPassword, user.password);

            if (match) {
                console.log('Login successful');
                // Générer et retourner un token JWT ou d'autres actions pour l'authentification réussie
            } else {
                console.log('Invalid password');
            }
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
    } finally {
        await client.close();
    }
    return res.send('Login');
}

export async function handleRedirectForgotPassword(req, res) {
    return res.send('Forgot Password');
}