var Rx = require('rx');
var rand = require('./random');
var teamTrades = new Rx.ReplaySubject(10000);

var ccys = [];

ccys.push('EURUSD');
ccys.push('EURGBP');
ccys.push('AUDCHF');
ccys.push('GBPCHF');
ccys.push('AUDUSD');
ccys.push('EURHKD');

for (var i = 0; i < 1000; i++) {
  var trade = {
    date: new Date(),
    ccyCpl: ccys[rand(0,5,0)],
    rate: rand(1.2, 1.3, 2),
    notional: 1000000 * i,
    status: 'done',
    direction: 'buy'
  };

  teamTrades.onNext(trade);
}

module.exports = function(blotter, io) {
  io.on('connection', function (socket) {

    teamTrades.subscribe(x => {
      socket.emit('teamTrade', x);
    });
  });
}