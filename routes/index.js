var express = require("express");
var router = express.Router();
const debug = require("debug")("retrotube/routes/index.js");


const youTubeAPI = require("../classes/youtubeAPI");
var yt = new youTubeAPI();
/* GET home page. */
router.get("/", function (req, res) {
  res.io.emit("socketToMe", "users");
  res.render("index", {
    title: "RetroTube -- Home"
  });
});

router.get("/search", function (req, res) {
  res.render("search", {
    title: "RetroTube -- Search"
  });
});

router.post("/search", async function (req, res) {
  debug(`Looking up username: ${req.body.searchQuery}`);
  try {
    var response = await yt.channels(
      req.body.searchQuery,
      "snippet,contentDetails,brandingSettings"
    );
    var result = {
      id: response.items[0].id,
      uploadsID: response.items[0].contentDetails.relatedPlaylists.uploads,
      name: response.items[0].brandingSettings.channel.title,
      picDefault: response.items[0].snippet.thumbnails.default.url,
      picMedium: response.items[0].snippet.thumbnails.medium.url,
      picHigh: response.items[0].snippet.thumbnails.high.url,
      description: response.items[0].snippet.description
    };
    res.render("search", {
      title: "RetroTube -- Search",
      result: result
    });
  } catch (error) {
    debug(`❌ : ${error}`)
    res.redirect("/search"); // Blank search box showing 0 results
  }
});

router.get("/watch/*", async function (req, res) {
  try {
    var res = req.originalUrl.split('/');
    var vids = await yt.getVideosFromChannel(res[2]);
    debug(vids)
  } catch (error) {
    throw error
  }

});
module.exports = router;