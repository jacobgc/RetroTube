var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('retrotube/app.js');
var SocketDebug = require('debug')('retrotube/app.js(SOCKET)');
require('dotenv').config()
var playerAPI = require('./classes/player');
var youtubeAPI = require('./classes/youtubeAPI');

player = new playerAPI();
yt = new youtubeAPI();

var index = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.io = io;
  next();
});


io.on('connection', function (socket) {
  socket.on('client', (data, response) => {
    SocketDebug(`Client: ${socket.id} : ${data}`);
  });

  socket.on('iWantAVideo', async (data, response) => {
    var video = await player.checkLockStatus(data);
    var TTL = await player.checkLockTTL(data);
    if (video) {
      debug("Responding to client");
      response({
        videoID: video,
        TTL: TTL
      });
      debug("Responded to client");
    } else {
      var allVideos = await yt.getVideosFromChannel(data);
      var oldVideos = [];
      allVideos.forEach(video => {
        var uploadDate = Date.parse(video[4]);
        if (uploadDate <= Date.now() - 94620000) {
          debug(`Video: '${video[1]}' is older than 3 years, adding to oldVideos`);
          oldVideos.push(video);
        };
      });
      var randomVideo = oldVideos[Math.floor(Math.random() * oldVideos.length)];
      debug(`Video '${randomVideo[1]}' selected.`);
      var duration = await yt.getDurationOfVideo(randomVideo[1]);
      await player.setLock(data, duration, randomVideo[1]);
      response({
        videoID: randomVideo[1],
        TTL: duration
      });
    }
  });

  SocketDebug(`New socket from: ${socket.handshake.address}`)
  io.clients().sockets[socket.client.conn.id].emit("youShouldGetAVideo");
});


app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// error handler
app.use(function (error, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  // render the error page
  res.status(error.status || 500);
  res.render('error', {
    title: 'RetroTube -- Error'
  });
});

module.exports = {
  app: app,
  server: server
};