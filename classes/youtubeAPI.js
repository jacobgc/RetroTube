const request = require("request-promise");
const debug = require("debug")("retrotube/classes/youtubeAPI.js");
const dataStorage = require('./dataStorage');
class youtubeAPI {
  /**
   * @description Uses the /v3/channels API end point to search for a user using the given username.
   * @param {string} username Username of the user you want to search
   * @param {string} part Comma separated list of details from the channel you want. Available options: "auditDetails", "brandingSettings", "contentDetails", "contentOwnerDetails", "id", "invideoPromotion", "localizations", "snippet", "statistics", "status", "topicDetails"
   * @returns {Promi1se} Contains an array of the data from the API endpoint
   * @throws rejected if no user found
   */
  async channels(username, part) {
    var ds = new dataStorage();

    const options = {
      uri: "https://www.googleapis.com/youtube/v3/channels",
      qs: {
        part: part, // -> uri + '?part=contentDetails',
        forUsername: username, // -> uri + '&forUsername=OfficialNerdCubed',
        key: process.env.youTubeKey // -> uri + '&key=XXXXXXX',
      },
      headers: {
        "User-Agent": "RetroTube-BackendRequest"
      },
      json: true // Automatically parses the JSON string in the response
    };

    debug("Requesting data from Youtube API");
    try {
      var response = await(request(options));
      debug("✔️ : Youtube API request successful");
      if (!response.pageInfo.totalResults < 1) {
        debug(
          `✔️ : Total Results for search: ${response.pageInfo.totalResults}`
        );
        debug(`✔️ : Channel ID: ${response.items[0].id}`);
        ds.storeYouTubeAccount(response);
        return (response);
      } else {
        debug("❌ : No channels found");
        return (response);
      }
    } catch (error) {
      debug(`❌ : ${error}`);
      throw error;
    }
  }
}

module.exports = youtubeAPI;