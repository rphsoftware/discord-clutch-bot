const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
let eexports = {}

module.exports = eexports

const cache = new Map();

async function ensureServer(id) {
    let a = await eexports.db.get("SELECT * FROM servers WHERE id = ?", [id]);
    if (!a) {
        await eexports.db.run("INSERT INTO servers(id, neutral, logs, enabled) VALUES(?, ?, ?, ?)", [id, "","",0]);
    }
}

eexports.setEnabled = async function(id, enabled) {
    cache.delete(id);
    await eexports.db.run("UPDATE servers SET enabled = ? WHERE id = ?", [enabled?1:0, id])
    return await eexports.getServer(id);
}

eexports.setLogs = async function(id, logs) {
    cache.delete(id);
    await eexports.db.run("UPDATE servers SET logs = ? WHERE id = ?", [logs, id])
    return await eexports.getServer(id);
}

eexports.setNeutral = async function(id, neutral) {
    cache.delete(id);
    await eexports.db.run("UPDATE servers SET neutral = ? WHERE id = ?", [neutral, id])
    return await eexports.getServer(id);
}

eexports.getServer = async function(id) {
    if (cache.has(id)) {
        return cache.get(id);
    }

    await ensureServer(id);

    cache.set(id, await eexports.db.get("SELECT * FROM servers WHERE id = ?", [id]));

    return cache.get(id);
}

eexports.load = async function() {
    eexports.db = await open({
        filename: 'config.db',
        driver: sqlite3.Database
    });
}