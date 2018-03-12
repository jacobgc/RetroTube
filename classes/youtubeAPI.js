const request = require("request-promise");
const debug = require("debug")("retrotube/classes/youtubeAPI.js");
class youtubeAPI {
  /**
   * @description Uses the /v3/channels API end point to search for a user using the given username.
   * @param {string} username Username of the user you want to search
   * @param {string} part Comma separated list of details from the channel you want. Available options: "auditDetails", "brandingSettings", "contentDetails", "contentOwnerDetails", "id", "invideoPromotion", "localizations", "snippet", "statistics", "status", "topicDetails"
   * @returns {Promi1se} Contains an array of the data from the API endpoint
   * @throws rejected if no user found
   */
  async channels(username, part) {

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
      var response = await (request(options));
      debug("✔️ : Youtube API request successful");
      if (!response.pageInfo.totalResults < 1) {
        debug(
          `✔️ : Total Results for search: ${response.pageInfo.totalResults}`
        );
        debug(`✔️ : Channel ID: ${response.items[0].id}`);
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

  async getVideosFromChannel(ID){

    var options = {
      uri: "https://www.googleapis.com/youtube/v3/playlistItems",
      qs: {
        part: 'snippet', // -> uri + '?part=snippet',
        maxResults: 50,
        playlistId: ID, // -> uri + '&ID=UUKab3hYnOoTZZbEUQBMx-ww',
        key: process.env.youTubeKey // -> uri + '&key=XXXXXXX',
      },
      headers: {
        "User-Agent": "RetroTube-BackendRequest"
      },
      json: true // Automatically parses the JSON string in the response
    };

    debug("Requesting data from Youtube API");
    try {
      var curPage = 1;
      var vids = []
      var parsedVids = []
      var response = await (request(options));
      debug("✔️ : Youtube API request successful");
      vids.push(response.items);
      while(response.nextPageToken){
        debug(`Looping to page: ${curPage++}`);
        options = {
          uri: "https://www.googleapis.com/youtube/v3/playlistItems",
          qs: {
            part: 'snippet', // -> uri + '?part=snippet',
            maxResults: 50,
            playlistId: ID, // -> uri + '&ID=UUKab3hYnOoTZZbEUQBMx-ww',
            key: process.env.youTubeKey, // -> uri + '&key=XXXXXXX',
            pageToken: response.nextPageToken
          },
          headers: {
            "User-Agent": "RetroTube-BackendRequest"
          },
          json: true // Automatically parses the JSON string in the response
        };
        response = await (request(options));
        debug("✔️ : Youtube API request successful");
        vids.push(response.items);
      }     
      for (let index = 0; index < vids.length; index++) {
        const groupOfVids = vids[index];
        for (let index = 0; index < groupOfVids.length; index++) {
          const vid = groupOfVids[index];
          parsedVids.push([vid.snippet.channelId, vid.snippet.resourceId.videoId, vid.snippet.title, vid.snippet.description, vid.snippet.publishedAt, vid.snippet.thumbnails]);
        }
      }
      return parsedVids
    } catch (error) {
      debug(`❌ : ${error}`);
      throw error;
    }

  }
}

module.exports = youtubeAPI;