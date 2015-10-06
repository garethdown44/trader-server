var debugTicks = require('debug')('server:ticks');
var debugDirections = require('debug')('server:directions');
var debugDeltas = require('debug')('server:deltas');
var debugPrices = require('debug')('server:prices');
var debugSpreads = require('debug')('server:spreads');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Rx = require('rx');

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var streams = {};


// streams['EURGBP'] = createStream('EURGBP');
// streams['AUDCHF'] = createStream('AUDCHF');
// streams['GBPCHF'] = createStream('GBPCHF');
// streams['AUDUSD'] = createStream('AUDUSD');

io.on('connection', function (socket) {

  for (var stream in streams) {
    streams[stream].subscribe(function(tick) {
      debugTicks(tick);
      socket.emit('tick', tick);
    });
  }

  // stream.subscribe(function(x) {
  //   console.log(x.bid);
  //   socket.emit('tick', x);
  // });

  // socket.on('subscribe', function (ccyCpl) {
  //   debug('subscribe: ' + ccyCpl);

  // });
});

function rand(min, max, scale) {
  return (Math.random() * (max - min) + min).toFixed(scale);
}

var createStream = function(ccyCpl) {

  // stream of spreads, gives us:
  //
  // 1.12, 1.13, 1.05, etc
  var spreads = Rx.Observable
    .defer(function() {

      var val = parseFloat(rand(1,2,2)) / 10000;

      return Rx.Observable.return(val).delay(parseInt(rand(2000, 3000, 0)))
    }).repeat().do(debugSpreads);

  // spreads.subscribe(function(x) {
  //   debugSpreads(x);
  // })

  // stream of deltas, gives us:
  // 0.00005, 0.00004, 0.00002, etc
  var deltas = Rx.Observable
    .defer(function() {

      var delta = rand(1,6,0) / 100000;
      delta = parseFloat(delta.toFixed(5));

      return Rx.Observable.return(delta).delay(parseInt(rand(3000, 5000, 0)))
    }).repeat();

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
  var prices = deltas.startWith(1.20000).scan(function(acc, curr) {

    debugPrices('acc', acc);
    debugPrices('curr', curr);

    var yield = acc + curr;

    debugPrices('yield = ' + yield);

    return parseFloat(yield);
  });

  prices.subscribe(function(x) {
    debugPrices(x);
  });

  // the final stream combines the prices and the spreads
  var stream = prices.combineLatest(spreads).select(function(x) {

    var spread = x[1] / 2;
    var mid = parseFloat(x[0]);

    var bid = (mid - spread).toFixed(5);
    var ask = (mid + spread).toFixed(5);

    return { bid: bid, ask: ask, ccyCpl: ccyCpl };
  });

  return stream;

  //return Rx.Observable.return(1);
}

function randomTimeIntervalStream(minTime, maxTime, produceValue) {
  var stream = Rx.Observable
    .defer(function() {

      var val = produceValue();

      return Rx.Observable.return(val).delay(parseInt(rand(minTime, maxTime, 0)))
    }).repeat();

  return stream;
}

streams['EURUSD'] = createStream('EURUSD');



