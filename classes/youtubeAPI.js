const rp = require("request-promise");
const debug = require("debug")("retrotube/classes/youtubeAPI.js");
class youtubeAPI {
  /**
   * @description Uses the /v3/channels API end point to search for a user using the given username.
   * @param {string} username Username of the user you want to search
   * @param {string} part Comma separated list of details from the channel you want. Available options: "auditDetails", "brandingSettings", "contentDetails", "contentOwnerDetails", "id", "invideoPromotion", "localizations", "snippet", "statistics", "status", "topicDetails"
   * @returns {Promise} Contains an array of the data from the API endpoint
   * @throws rejected if no user found
   */
  channels(username, part) {
    return new Promise(function(resolve, reject) {
      var options = {
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

      rp(options)
        .then(function(response) {
          debug("Youtube API request went well");
          if (!response.pageInfo.totalResults < 1) {
            debug(
              `Total Results for search: ${response.pageInfo.totalResults}`
            );
            debug(`Channel ID: ${response.items[0].id}`);
            resolve(response);
          } else {
            debug("No channels found");
            reject("No user found");
          }
        })
        .catch(function(err) {
          debug("Oh dear, We failed to use the YouTube API");
          throw err;
        });
    });
  }
}

module.exports = youtubeAPI;
