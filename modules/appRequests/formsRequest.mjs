import { MongoClient } from "mongodb";

export async function handleRedirectRegister(req, res) {
    // Il faudra penser à mettre ça en variable d'environnement
    const username = "GamuClient"
    const password = encodeURIComponent("Kn8_#sE@az378")
    const uri = `mongodb://${username}:${password}@vps.gamunetwork.com:27017/GamuNetwork`

    const client = new MongoClient(uri);
    await client.connect();
    client.db("GamuNetwork").collection("players").insertOne({ name: "test" });
    return res.send('Register');
}

export function handleRedirectLogin(req, res) {
    return res.send('Login');
}

export function handleRedirectForgotPassword(req, res) {
    return res.send('Forgot Password');
}