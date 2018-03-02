var express = require("express");
var router = express.Router();
const debug = require("debug")("retrotube/routes/index.js");


const youTubeAPI = require("../classes/youtubeAPI");
const dataStorage = require("../classes/dataStorage");
/* GET home page. */
router.get("/", function (req, res) {
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
  var yt = new youTubeAPI();
  debug(`Looking up username: ${req.body.searchQuery}`);
  try {
    var response = await yt.channels(
      req.body.searchQuery,
      "snippet,contentDetails,brandingSettings"
    );
    var result = {
      id: response.items[0].id,
      name: response.items[0].brandingSettings.channel.title,
      picDefault: response.items[0].snippet.thumbnails.default.url,
      picMedium: response.items[0].snippet.thumbnails.medium.url,
      picHigh: response.items[0].snippet.thumbnails.high.url,
      description: response.items[0].snippet.description
    };
    debug("Rendering search page with result");
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
  const ds = new dataStorage();
  try {
    ds.storeYouTubeAccount();
  } catch (error) {
    debug(`❌:${error}`);
    throw error
  }
});
module.exports = router;