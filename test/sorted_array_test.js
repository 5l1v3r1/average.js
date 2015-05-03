var assert = require('assert');
var numbers = require('./rand.js');
var SortedArray = require('../build/average.js').SortedArray;

for (var i = 0; i < numbers.length; ++i) {
  if (numbers[i] < 1000) {
    numbers[i] = -Infinity;
  } else if (numbers[i] > 60000-1000) {
    numbers[i] = Infinity;
  }
}

function arrayValue(sortedArray) {
  var res = [];
  for (var i = 0; i < sortedArray.count(); ++i) {
    res[i] = sortedArray.get(i);
  }
  return res;
}

function testForSize(size) {
  var inc = Math.max(size, 1);
  for (var i = 0; i < numbers.length-size; i += inc) {
    var subset = numbers.slice(i, i+size);
    var sortedArray = new SortedArray();
    for (var j = 0; j < subset.length; ++j) {
      sortedArray.add(subset[j]);
    }
    subset.sort(function(a, b) {
      return a - b;
    });
    assert.deepEqual(subset, arrayValue(sortedArray));
  }
}

for (var i = 0; i < 3; ++i) {
  testForSize(i);
}
testForSize(50);
console.log('PASS');
