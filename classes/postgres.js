const debug = require("debug")("retrotube/classes/postgres.js");
const {
    Client
} = require("pg");

class postgres {

    /** 
     * @name connect
     * @description Used to connect to the database provided by the DATABASE_URL env variable
     * @returns {Promise}
     */
    async connect() {
        debug('Creating database client');
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true,
        });
        debug('Connecting to the database');
        await client.connect();
        debug("✔️ : Connected to the database");
        this.client = client;
        return
    }

    /** 
     * @name disconnect
     * @description Used to disconnect from the database in scope
     * @returns {Promise}
     */
    async disconnect() {
        if (this.client) {
            debug('Disconnecting from the database');
            await this.client.end();
            debug('Disconnected from the database');
        } else {
            debug('No connected database to disconnect from');

        }
        return;

    }

    /** 
     * @name select
     * @description Used to select from the database
     * @param {string} query The query to use against the database, without "SELECT"
     * @returns {Promise}
     * 
     */
    async select(query){
        this.client.query('SELECT NOW() as now', (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              console.log(res.rows[0])
            }
          })
    }

}

module.exports = postgres;