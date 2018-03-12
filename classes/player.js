const debug = require("debug")("retrotube/classes/dataStorage.js");
const dataStorage = require("./dataStorage");

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });

class player {


}

module.exports = dataStorage;