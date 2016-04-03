var MarketMuster = require("marketmuster");
var marketmuster = new MarketMuster();
 
marketmuster.streamQuotes(["TSLA", "AAPL", "GOOG"], function(stream){
    stream.on("AAPL", function(quote){
        console.log(quote);
    });
 
    stream.on("TSLA", function(quote){
        console.log(quote);
    });

    stream.on("GOOG", function(quote){
        console.log(quote);
    });
});