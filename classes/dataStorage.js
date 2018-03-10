const debug = require("debug")("retrotube/classes/dataStorage.js");
const db = require("./postgres.js");

class dataStorage {

    /** 
     * @description Used to store a channel in the database
     * @param {string} account The account to add to the database
     * @returns {Promise}
     */
    async storeYouTubeAccount(account) {
        if (account) {
            var postgresDatabase = new db();
            try {
                debug(`Connecting to database`);
                await postgresDatabase.connect();
                debug(`Searching for channel: ${account.name} / ${account.id}`)
                var result = await postgresDatabase.client.query(`SELECT * FROM retrotube.channels WHERE id='${account.id}';`);
                if (result.rowCount === 0) {
                    debug(`Channel Not in database, inserting now`);
                    var result = await postgresDatabase.client.query(`INSERT INTO retrotube.channels(id, "uploadsID", name, "picDefault", "picMedium", "picHigh", description, "lastCheckedForVideos") VALUES($1, $2, $3, $4, $5, $6, $7, null) RETURNING *`, [account.id, account.uploadsID, account.name, account.picDefault, account.picMedium, account.picHigh, account.description]);
                    debug(`Channel inserted. UID: ${result.rows[0].UID}`)
                } else {
                    debug(`Channel in DB, ignoring`);
                }

            } catch (error) {
                debug(`❌ : ${error}`);
                throw error;
            }
        }

    }

    async storeYouTubeVideos(vids) {
        if (vids) {
            var postgresDatabase = new db();
            try {
                debug(`Connecting to database`);
                await postgresDatabase.connect();

                for (let index = 0; index < vids.length; index++) {
                    var vid = vids[index];
                    debug(`Adding ${vid[2]} to the database`);
                    await postgresDatabase.client.query(`INSERT INTO retrotube.videos("channelID", "ID", title, description, "publishedAt", thumbnails ) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`, [vid[0], vid[1], vid[2], vid[3], vid[4], vid[5]]);
                    debug(`✔️ : Added ${vid[2]} to the database`);
                }
                var epoch = (new Date).getTime();
                debug(`Updating users lastCheckedForVideos timestamp`);
                await postgresDatabase.client.query(`UPDATE retrotube.channels SET "lastCheckedForVideos"=${epoch} WHERE id='${vids[0][0]}'`); // [0][0] First result from vids array, first index is channel ID
                debug(`✔️ : Updated timestamp`);
            } catch (error) {
                debug(`❌ : ${error}`);
                throw error;
            }
        }

    }

}

module.exports = dataStorage;