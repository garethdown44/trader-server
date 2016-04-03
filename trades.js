var debugTrades = require('debug')('server:trades');

module.exports = function(blotter, app) {

  var tradeEndpoints = {};
  tradeEndpoints['EURUSD'] = {delay: 500, success: true};
  tradeEndpoints['EURGBP'] = {delay: 1000, success: true};

  // todo: for now make them all true until error handling added to
  //       the client
  //tradeEndpoints['AUDCHF'] = {delay: 300, success: function() {  return rand(0, 1, 0) == 0; }};
  tradeEndpoints['AUDCHF'] = {delay: 300, success: true};
  tradeEndpoints['GBPCHF'] = {delay: 300, success: true};
  tradeEndpoints['AUDUSD'] = {delay: 300, success: true};

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.post('/trades/execute', function(req, res) {

    debugTrades(req.body);

    var ccyCpl = req.body.ccyCpl;

    if (!ccyCpl) {
      return;
    }

    debugTrades(ccyCpl);
    debugTrades(tradeEndpoints);
    debugTrades(tradeEndpoints[ccyCpl]);

    var endpoint = tradeEndpoints[ccyCpl];
    var result;

    if (isFunction(endpoint.success)) {
      result = endpoint.success();
    } else {
      result = endpoint.success;
    }

    var statusCode = result ? 200 : 500;

    var complete = function() {

      var trade = {
        date: new Date(),
        ccyCpl: ccyCpl,
        rate: req.body.rate,
        notional: req.body.notional,
        status: 'done',
        direction: req.body.action
      };

      debugTrades(trade);

      blotter.onNext(trade);
      res.sendStatus(statusCode).end();
    }

    setTimeout(complete, endpoint.delay);
  });
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
