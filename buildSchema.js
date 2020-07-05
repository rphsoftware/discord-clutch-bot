const db = require('./db');
module.exports = async function schema() {
    await db.db.run("CREATE TABLE IF NOT EXISTS servers(id text, neutral text, logs text, enabled integer)");
}