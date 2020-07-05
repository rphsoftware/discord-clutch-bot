const {getServer, setEnabled, setNeutral, setLogs}=require('./db');
const {pressClutch} = require('./clutchStorage');
async function helpCommand(msg) {
    await msg.channel.send(" ", {
        embed: {
            hexColor: "#2980ee",
            color: parseInt("2980ee", 16),
            title: "Manual gearbox bot help",
            type: "rich",
            description: "Feel like you're driving a manual! Press the clutch to shift between voice channels! Here are the commands for this bot:",
            fields: [
                {
                    name: "help",
                    value: "View this help document",
                    inline: true
                },
                {
                    name: "status",
                    value: "Show status of the bot in this server",
                    inline: true
                },
                {
                    name: "neutral <id>",
                    value: "Set voice channel to be considered the neutral gear",
                    inline: true
                },
                {
                    name: "logs <id>",
                    value: "Set text channel for bullying users about forgetting to press the clutch",
                    inline: true
                },
                {
                    name: "start",
                    value: "Start enforcing clutch pressing",
                    inline: true
                },
                {
                    name: "stop",
                    value: "Stop enforcing clutch pressing",
                    inline: true
                }
            ],
            footer: {
                text: "To press the clutch itself, type !clutch <time in seconds>"
            }
        }
    })
}

async function statusCommand(msg, override) {
    let mesg = await msg.channel.send(":hourglass: Please wait... :hourglass: ");
    // Perform database lookup
    let res = await getServer(msg.guild.id);
    await mesg.edit(" ", {
        embed: {
            hexColor: "#2980ee",
            color: parseInt("2980ee", 16),
            title: override ? override : "Status of bot in this server",
            fields: [
                {
                    name: "Enabled?",
                    value: res.enabled === 1 ? ":white_check_mark:" : ":x:",
                },
                {
                    name: "Neutral channel",
                    value: msg.guild.channels.cache.has(res.neutral) ?  msg.guild.channels.cache.get(res.neutral).name : ":x: No channel set! :x:",
                },
                {
                    name: "Log channel",
                    value: msg.guild.channels.cache.has(res.logs) ?  msg.guild.channels.cache.get(res.logs).name : ":x: No channel set! :x:",
                }
            ]
        }
    })
}

async function toggleCommand(msg, towards) {
    if (!msg.member.permissions.has("ADMINISTRATOR")) {
        return msg.reply("You need admin permission to configure this bot.");
    }

    if (towards === true) {
        let s = await getServer(msg.guild.id);
        if (!msg.guild.channels.cache.has(s.neutral) || !msg.guild.channels.cache.has(s.logs)) {
            return msg.reply("You need to configure all channels before enabling.");
        }
    }

    await setEnabled(msg.guild.id, towards);
    return await statusCommand(msg, "Bot configuration updated! New configuration:");
}

async function neutralCommand(msg) {
    if (!msg.member.permissions.has("ADMINISTRATOR")) {
        return msg.reply("You need admin permission to configure this bot.");
    }

    let cid = msg.content.split(" ");
    if (cid.length !== 2) {
        return msg.reply("This command requires EXACTLY 1 argument and it MUST be the channel ID of the neutral channel!");
    }

    if (!msg.guild.channels.cache.has(cid[1])) {
        return msg.reply("This channel does not exist!");
    }

    let chan = msg.guild.channels.cache.get(cid[1])
    if (chan.type !== "voice") {
        return msg.reply("Must be a voice channel!");
    }

    await setNeutral(msg.guild.id, cid[1]);
    return await statusCommand(msg, "Bot configuration updated! New configuration:");
}

async function logsCommand(msg) {
    if (!msg.member.permissions.has("ADMINISTRATOR")) {
        return msg.reply("You need admin permission to configure this bot.");
    }

    let cid = msg.content.split(" ");
    if (cid.length !== 2) {
        return msg.reply("This command requires EXACTLY 1 argument and it MUST be the channel ID of the logs channel!");
    }

    if (!msg.guild.channels.cache.has(cid[1])) {
        return msg.reply("This channel does not exist!");
    }

    let chan = msg.guild.channels.cache.get(cid[1])
    if (chan.type !== "text") {
        return msg.reply("Must be a text channel!");
    }

    await setLogs(msg.guild.id, cid[1]);
    return await statusCommand(msg, "Bot configuration updated! New configuration:");
}

module.exports = async function (msg) {
    if (msg.content.startsWith("clutchorkick:")) { /// ADMIN COMMANDS
        let command = msg.content.split(":")[1].split(" ")[0];
        if (command === "help") {
            return await helpCommand(msg);
        }
        if (command === "status") {
            return await statusCommand(msg);
        }
        if (command === "start") {
            return await toggleCommand(msg, true);
        }
        if (command === "stop") {
            return await toggleCommand(msg, false);
        }
        if (command === "neutral") {
            return await neutralCommand(msg);
        }
        if (command === "logs") {
            return await logsCommand(msg);
        }
    }
    if (msg.content.startsWith("!clutch")) { // USER COMMAND.... (no s because there only is one lol)
        let args = msg.content.split(" ");
        if (args.length !== 2) {
            return await msg.reply("You must provide exactly 1 argument and it must be a number between 1 and 10!");
        }

        if (!parseInt(args[1])) {
            return await msg.reply("You must provide exactly 1 argument and it must be a number between 1 and 10!");
        }

        let num = parseInt(args[1]);

        if (num < 1 || num > 10) {
            return await msg.reply("You must provide exactly 1 argument and it must be a number between 1 and 10!");
        }

        await pressClutch(msg, num);

        await msg.channel.send(`You have ${num} seconds to shift channels!`);
    }
}