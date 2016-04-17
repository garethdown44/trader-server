var app = require('express')();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(server);
var Rx = require('rx');

var port = process.env.PORT || 8081;
server.listen(port);

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var blotter = new Rx.ReplaySubject(30);

require('./trades')(blotter, app);
require('./prices')(io);
require('./my-trades')(blotter, io);
require('./team-trades')(blotter, io);
require('./price-option')(app);

app.get('/up', function(req, res) {

  setTimeout(function() {
    res.status(200).end();
  }, 1000);
});