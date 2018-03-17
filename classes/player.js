const debug = require("debug")("retrotube/classes/player.js");
var rtg = require("url").parse(process.env.REDISTOGO_URL);
redis = require("redis").createClient(rtg.port, rtg.hostname);
const {
  promisify
} = require("util");

redis.getAsync = promisify(redis.get).bind(redis);
redis.setAsync = promisify(redis.set).bind(redis);
redis.TTLAsync = promisify(redis.ttl).bind(redis);

(async function() {
  try {
    debug("Authenticating with redis");
    await redis.auth(rtg.auth.split(":")[1]);
    debug("Authenticated");
  } catch (error) {
    throw error;
  }
})();

class player {
  async setLock(username, videoLength, videoID) {
    try {
      debug(`Locking ${username} for: ${videoLength} seconds`);
      await redis.setAsync(`${username}:lock`, videoID, "EX", videoLength);
      debug(`Lock set`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async checkLockStatus(username) {
    try {
      debug(`Checking if lock for ${username} is in redis`);
      var lockStatus = await redis.getAsync(`${username}:lock`);
      if (lockStatus) {
        debug(`${username}: Locked`);
        return lockStatus;
      } else {
        debug(`${username}: Not locked`);
        return false;
      }
    } catch (error) {
      debug(error)
    }
  }

  async checkLockTTL(username) {
    try {
      debug(`Checking TTL for ${username} in redis`);
      var TTL = await redis.TTLAsync(`${username}:lock`);
      debug(TTL);
      if (TTL != -2) {
        // Redis returns -2 if the row doesn't exist
        debug(`Time to live for ${username}: ${TTL}`);
        return TTL;
      } else {
        debug(`No TTL found for ${username}`);
        return false;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = player;