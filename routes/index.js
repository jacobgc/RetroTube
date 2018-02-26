var express = require("express");
var router = express.Router();
const debug = require("debug")("retrotube/routes/index.js");
const rp = require("request-promise");
/* GET home page. */
router.get("/", function(req, res) {
  res.render("index", {
    title: "RetroTube -- Home"
  });
});

router.get("/search", function(req, res) {
  res.render("search", {
    title: "RetroTube -- Search"
  });
});

router.post("/search", function(req, res) {
  debug(req.body.searchQuery);

  var options = {
    uri: "https://www.googleapis.com/youtube/v3/channels",
    qs: {
      part: "snippet,contentDetails,brandingSettings", // -> uri + '?part=contentDetails',
      forUsername: req.body.searchQuery, // -> uri + '&forUsername=OfficialNerdCubed',
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
        debug(`Total Results for search: ${response.pageInfo.totalResults}`);
        debug(`Channel ID: ${response.items[0].id}`);
        var result = {
          name: response.items[0].brandingSettings.channel.title,
          id: response.items[0].id,
          picDefault: response.items[0].snippet.thumbnails.default.url,
          picMedium: response.items[0].snippet.thumbnails.medium.url,
          picHigh: response.items[0].snippet.thumbnails.high.url,
          description: response.items[0].snippet.description
        };
        res.render("search", {
          title: "RetroTube -- Search",
          result: result
        });
      } else {
        debug("No channels found");
        res.redirect("/search");
      }
    })
    .catch(function(err) {
      debug("Oh dear, We failed to use the YouTube API");
      throw err;
    });
});
module.exports = router;
