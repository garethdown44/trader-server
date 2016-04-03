var debugTicks = require('debug')('server:streams:ticks');
var debugDirections = require('debug')('server:streams:directions');
var debugDeltas = require('debug')('server:streams:deltas');
var debugPrices = require('debug')('server:streams:prices');
var debugSpreads = require('debug')('server:streams:spreads');

var Rx = require('rx');

var rand = require('./random');

module.exports = function(io) {

  var streams = {};

  io.on('connection', function (socket) {

    for (var stream in streams) {
      streams[stream].subscribe(function(tick) {
        socket.emit('tick', tick);
      });
    }
  });

  var createStream = function(ccyCpl, initialValue) {

    // stream of spreads, gives us:
    //
    // 1.12, 1.13, 1.05, etc
    var spreads = randomTimeIntervalStream(2000, 3000, function() {
      var val = parseFloat(rand(1,2,2)) / 10000;
      return val;
    }).do(debugSpreads);

    // stream of deltas, gives us:
    // 0.00005, 0.00004, 0.00002, etc
    var deltas = randomTimeIntervalStream(25, 5000, function() {
        var delta = rand(1,6,0) / 100000;
        delta = parseFloat(delta.toFixed(5));

        return delta;
    });

    // stream of directions, e.g.
    // 1, -1, -1, 1, etc
    var directions = randomTimeIntervalStream(1000, 2000, function() {
      var val = rand(0, 1, 0);

      return val == 0 ? -1 : 1;
    });

    // combine the deltas with the directions to get:
    // 0.00001, -0.00003, etc
    deltas = deltas.combineLatest(directions).select(function(x) {
      return x[0] * x[1];
    }).do(debugDeltas);

    // take the deltas, start with 1.2, and accumulate the value
    // using scan
    // e.g.
    //
    // 1.20000 + -0.00005 = 1.19995
    var prices = deltas.startWith(initialValue).scan(function(acc, curr) {

      debugPrices('acc', acc);
      debugPrices('curr', curr);

      var yield = acc + curr;

      debugPrices('yield = ' + yield);

      return parseFloat(yield);
    }).do(debugPrices);

    // the final stream combines the prices and the spreads
    var stream = prices.combineLatest(spreads).select(function(x) {

      var spread = x[1] / 2;
      var mid = parseFloat(x[0]);

      var bid = (mid - spread).toFixed(5);
      var ask = (mid + spread).toFixed(5);

      return { bid: bid, ask: ask, ccyCpl: ccyCpl };
    }).do(debugTicks);

    return stream;
  }

  function randomTimeIntervalStream(minTime, maxTime, produceValue) {
    var stream = Rx.Observable
      .defer(function() {

        var val = produceValue();

        return Rx.Observable.return(val).delay(parseInt(rand(minTime, maxTime, 0)))
      }).repeat();

    return stream;
  }
  
  streams['EURUSD'] = createStream('EURUSD', 1.20000).singleInstance();
  streams['EURGBP'] = createStream('EURGBP', 1.30000).singleInstance();
  streams['AUDCHF'] = createStream('AUDCHF', 1.44334).singleInstance();
  streams['GBPCHF'] = createStream('GBPCHF', 1.23411).singleInstance();
  streams['AUDUSD'] = createStream('AUDUSD', 1.11234).singleInstance();
  streams['EURHKD'] = createStream('EURHKD', 1.56789).singleInstance();
}