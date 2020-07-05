const Discord = require('discord.js');
const fs = require('fs').promises;
const db = require('./db');
const bs = require('./buildSchema');

(async function 𒄡() {
    const client = new Discord.Client();
    const token = await fs.readFile("token", "utf-8")

    process.once('SIGINT', async function () {
        await client.destroy()
        process.exit(0);
    });

    process.once('SIGTERM', async function () {
        await client.destroy()
        process.exit(0)
    });
    await client.login(token);
    await new Promise(resolve => client.once("ready", resolve));

    module.exports = client;

    console.log("Connected to Discord");
    console.log("Loading storage adapter...");

    await db.load();

    console.log("Creating schema...");

    await bs();

    console.log("Starting actual bot");

    client.on("message", require('./messageHandler'));
    client.on("voiceStateUpdate", require('./bullyEngine'));
})();