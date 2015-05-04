var bench = require('./bench.js');
var numbers = require('../test/rand.js');
var CenterAverage = require('../build/average.js').CenterAverage;

function benchmarkCenterAverage(size, numRemove) {
  var name = 'CenterAverage(' + size + ', ' + numRemove + ').pushValue';
  bench(name, function(count) {
    var avg = new CenterAverage(size, numRemove);
    for (var i = 0; i < count; ++i) {
      avg.pushValue(numbers[i % numbers.length]);
    }
  });
}

var sizes = [1, 3, 5, 12, 50, 100, 1000];
var numRemove = [0, 0, 1, 1, 3, 5, 50];
for (var i = 0; i < sizes.length; ++i) {
  benchmarkCenterAverage(sizes[i], numRemove[i]);
}
