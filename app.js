var debug = require('debug')('server');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Rx = require('rx');

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var streams = {};

streams['EURUSD'] = createStream('EURUSD');
// streams['EURGBP'] = createStream('EURGBP');
// streams['AUDCHF'] = createStream('AUDCHF');
// streams['GBPCHF'] = createStream('GBPCHF');
// streams['AUDUSD'] = createStream('AUDUSD');

io.on('connection', function (socket) {

  for (var stream in streams) {
    streams[stream].subscribe(function(tick) {
      console.log(tick);
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

function createStream(ccyCpl) {

  //var previousBid = rand(1, 2, 5);
  //var previousOffer = rand(1, 2, 5);

  var spreads = Rx.Observable
    .defer(function() {

      return Rx.Observable.return(rand(1,2,2)).delay(parseInt(rand(2000, 3000, 0)))
    }).repeat();

  var prices = Rx.Observable
    .defer(function() {

      return Rx.Observable.return(rand(1,2,5)).delay(parseInt(rand(3000, 5000, 0)))
    }).repeat();

  var stream = prices.combineLatest(spreads).select(function(x) {

    console.log(x);

    var spread = (x[1] / 1000) / 2;
    var mid = parseFloat(x[0]);

    var bid = (mid - spread).toFixed(5);
    var ask = (mid + spread).toFixed(5);

    return { bid: bid, ask: ask, ccyCpl: ccyCpl };
  })

  return stream;
}

Rx.Observable.prototype.pairWithPrevious = function() {
  return this.scan(0, 0), function(acc, curr) { return { prev: acc.item1, curr: acc.item2}; };
};


// public static IObservable<Tuple<TSource, TSource>>
//     PairWithPrevious<TSource>(this IObservable<TSource> source)
// {
//     return source.Scan(
//         Tuple.Create(default(TSource), default(TSource)),
//         (acc, current) => Tuple.Create(acc.Item2, current));
// }






