var Rx = require('rx');

var source = Rx.Observable.range(1, 3);

var other = Rx.Observable.range(4, 2);

source.selectMany(other).subscribe(function(x) {
  console.log(x);
});