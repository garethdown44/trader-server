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

// this endpoint is here so that the client has something to call to make sure the
// server is up and notify the user if it's waiting. heroku's free instances stop the 
// process periodically and this causes the client to hang while it's waiting for the 
// server to spin up.
app.get('/up', function(req, res) {
  res.status(200).end();
});

console.log('trader-server running on port ' + port);
