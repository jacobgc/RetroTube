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

  async getDurationOfVideo(VideoID){
    var options = {
      uri: "https://www.googleapis.com/youtube/v3/videos",
      qs: {
        part: 'contentDetails', // -> uri + '?part=snippet',
        maxResults: 1,
        id: VideoID, // -> uri + '&ID=UUKab3hYnOoTZZbEUQBMx-ww',
        key: process.env.youTubeKey // -> uri + '&key=XXXXXXX',
      },
      headers: {
        "User-Agent": "RetroTube-BackendRequest"
      },
      json: true // Automatically parses the JSON string in the response
    };

    try {
      var response = await (request(options));
      debug("✔️ : Youtube API request successful");
      return youtubeDurationToSeconds(response.items[0].contentDetails.duration);
      } catch (error) {
      debug(`❌ : ${error}`);
      throw error;
    }
  }

  async getVideosFromChannel(ID){
    var options = {
      uri: "https://www.googleapis.com/youtube/v3/playlistItems",
      qs: {
        part: 'snippet, contentDetails', // -> uri + '?part=snippet',
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
            part: 'snippet, contentDetails', // -> uri + '?part=snippet',
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


function youtubeDurationToSeconds(duration) {
	var hours   = 0;
	var minutes = 0;
	var seconds = 0;

	// Remove PT from string ref: https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration
	duration = duration.replace('PT','');

	// If the string contains hours parse it and remove it from our duration string
	if (duration.indexOf('H') > -1) {
		hours_split = duration.split('H');
		hours       = parseInt(hours_split[0]);
		duration    = hours_split[1];
	}

	// If the string contains minutes parse it and remove it from our duration string
	if (duration.indexOf('M') > -1) {
		minutes_split = duration.split('M');
		minutes       = parseInt(minutes_split[0]);
		duration      = minutes_split[1];
	}

	// If the string contains seconds parse it and remove it from our duration string
	if (duration.indexOf('S') > -1) {
		seconds_split = duration.split('S');
		seconds       = parseInt(seconds_split[0]);
	}

	// Math the values to return seconds
	return (hours * 60 * 60) + (minutes * 60) + seconds;
}

module.exports = youtubeAPI;