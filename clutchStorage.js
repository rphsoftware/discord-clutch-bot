const client = require('./bot')
let mod = {
    cache: new Map(),
    pressClutch: async function(msg, time) {
        if (!mod.cache.has(msg.guild.id)) {
            mod.cache.set(msg.guild.id, new Map());
        }

        let scache = mod.cache.get(msg.guild.id);
        if (scache.has(msg.author.id)) {
            return await msg.reply("You already have the clutch pressed!");
        }

        let options = {
            wasMuted: client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.serverMute,
            wasDeaf: client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.serverDeaf,
        }

        scache.set(msg.author.id, options);
        try { await client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.setDeaf(true, "Clutch pressed");} catch(e){}
        try { await client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.setMute(true, "Clutch pressed");} catch(e){}

        setTimeout(async function() {
            if (options.wasDeaf === false)
                try {await client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.setDeaf(false, "Clutch depressed");} catch (e) {}

            if (options.wasMuted === false)
                try {await client.guilds.cache.get(msg.guild.id).members.cache.get(msg.author.id).voice.setMute(false, "Clutch depressed");} catch (e) {}

            scache.delete(msg.author.id);
        }, time * 1000);
    }
}


module.exports = mod