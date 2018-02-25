var express = require("express");
var router = express.Router();
const debug = require('debug')('retrotube/routes/index.js');

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});


router.post("/search", function(req,res,next){
  debug('hello')
})
module.exports = router;