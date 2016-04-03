module.exports = function(blotter, io) {

  io.on('connection', function (socket) {

    blotter.subscribe(function(position) {

      socket.emit('position', position);
    });
  });
}