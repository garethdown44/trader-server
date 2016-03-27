module.exports = function(blotter, io) {

  io.on('connection', function (socket) {

    blotter.subscribe(function(position) {
      socket.emit('position', position);
    });

    for (var i = 0; i < 1000; i++) {

      var trade = {
        date: new Date(),
        ccyCpl: 'EURUSD',
        rate: 1.2,
        notional: 1000000 * i,
        status: 'done',
        direction: 'buy'
      };

      socket.emit('teamTrade', trade);
    }
  });
}