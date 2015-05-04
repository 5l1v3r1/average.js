var bench = require('./bench.js');
var SortedArray = require('../build/average.js').SortedArray;

function benchmarkSortedArray(size) {
  var array = new SortedArray(size);
  for (var i = 0; i < size; ++i) {
    array.add(i);
  }
  bench('SortedArray(' + size + ')', size, function(count) {
    for (var i = 0; i < count; i += size) {
      for (var j = 0; j < size; ++j) {
        array.remove(j);
        array.add(j);
      }
    }
  });
}

var sizes = [1, 3, 5, 12, 50, 100, 1000];
for (var i = 0; i < sizes.length; ++i) {
  benchmarkSortedArray(sizes[i]);
}
