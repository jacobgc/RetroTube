const debug = require("debug")("retrotube/classes/dataStorage.js");
const db = require("./postgres.js");

class dataStorage {

    /** 
     * @description Used to store a channel in the database
     * @param {string} account The account to add to the database
     * @returns {Promise}
     */
    async storeYouTubeAccount(account) {
        var postgresDatabase = new db();
        try {
          await postgresDatabase.connect();
          
        } catch (error) {
            debug(`❌ : ${error}`);
          throw error;
        }
    }

}

module.exports = dataStorage;