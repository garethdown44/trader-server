var Rx = require('rx');
var rand = require('./random');

var myPositions = new Rx.ReplaySubject(100);

module.exports = function(blotter, io) {
  io.on('connection', function (socket) {
    myPositions.subscribe(x => {
      io.emit('myPositions', x);
    })
  });
}