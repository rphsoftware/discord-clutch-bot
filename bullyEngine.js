const {getServer} = require('./db');
const {cache} = require('./clutchStorage');
module.exports = async function Æ(oldState, newState) {
    if (oldState.member.user.bot || newState.member.user.bot) return

    let server = await getServer(newState.guild.id);
    if (!server.enabled) return

    //// JOINING VOICE CHANNEL
    console.log(oldState.channelID, newState.channelID);
    if ((oldState.channelID === undefined || oldState.channelID === null) && newState.channelID !== null) {
        console.log("a");
        if (newState.channelID !== server.neutral) {
            //// WRONG CHANNEL NIG
            await newState.guild.channels.cache.get(server.logs).send(`**${newState.member.user.tag}** tried to start while in **${newState.channel.name}** and stalled their engine!`);
            await newState.member.voice.kick("Engine stalled!");
            return
        } else {
            return;
        }
    }

    if (oldState.channelID !== null && newState.channelID === null) { /// SPECIAL CONDITION
        return
    }

    if (oldState.channelID !== newState.channelID) {
        if (cache.get(newState.guild.id)) {
            if (!cache.get(newState.guild.id).has(newState.member.id)) {
                await newState.guild.channels.cache.get(server.logs).send(`**${newState.member.user.tag}** tried to shift into **${newState.channel.name}** but forgot to press the clutch and scratched their gearbox!`);
                await newState.member.voice.kick("Gearbox scratched!");
            }
        } else {
            await newState.guild.channels.cache.get(server.logs).send(`**${newState.member.user.tag}** tried to shift into **${newState.channel.name}** but forgot to press the clutch and scratched their gearbox!`);
            await newState.member.voice.kick("Gearbox scratched!");
        }
    }
}