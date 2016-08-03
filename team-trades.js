var Rx = require('rx');
var rand = require('./random');
var teamTrades = new Rx.ReplaySubject(10000);
var debug = require('debug')('trader:team-trades');

var ccys = [];

ccys.push('EURUSD');
ccys.push('EURGBP');
ccys.push('AUDCHF');
ccys.push('GBPCHF');
ccys.push('AUDUSD');
ccys.push('EURHKD');

var trades = [];

for (var i = 0; i < 1000; i++) {
  var trade = {
    date: new Date(),
    ccyCpl: ccys[rand(0,5,0)],
    rate: rand(1.2, 1.3, 2),
    notional: 100000 * rand(1,100,0),
    status: 'done',
    direction: 'buy'
  };

  trades.push(trade);
  teamTrades.onNext(trade);
}

module.exports = function(blotter, io) {
  io.on('connection', function (socket) {

    teamTrades.subscribe(x => {
      socket.emit('teamTrade', x);
    });

    socket.on('request', function(req) {

      debug('request', req);
      console.log(req);

      var slice = trades.slice(req.startRow, req.endRow);

      debug('sending back ' + slice.length + ' rows');

      socket.emit('response', slice);
    });
  });
}