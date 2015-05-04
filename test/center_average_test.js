var assert = require('assert');
var numbers = require('./rand.js');
var CenterAverage = require('../build/average.js').CenterAverage;

// Throw enough infinities into the mix for it to be realistic.
for (var i = 0; i < numbers.length; ++i) {
  if (numbers[i] < 1000) {
    numbers[i] = -Infinity;
  } else if (numbers[i] > 60000-1000) {
    numbers[i] = Infinity;
  }
}

function computeCenterAverage(i, size, numRemove) {
  var subset = numbers.slice(i-size+1, i+1);
  subset.sort(function(a, b) {
    return a - b;
  });
  var sum = 0;
  for (var i = numRemove; i < size-numRemove; ++i) {
    if (!isFinite(subset[i])) {
      return NaN;
    }
    sum += subset[i];
  }
  return sum / (size - numRemove*2)
}

function testCenterAverage(size, numRemove) {
  var totalUse = numbers.length;
  if (size === 1000) {
    totalUse = 10000;
  }

  var avg = new CenterAverage(size, numRemove);
  for (var i = 0; i < totalUse; ++i) {
    avg.pushValue(numbers[i]);
    if (i >= size-1) {
      var actual = avg.average();
      var expected = computeCenterAverage(i, size, numRemove);
      assert.equal(isNaN(actual), isNaN(expected));
      if (!isNaN(actual)) {
        assert(Math.abs(actual - expected) < 0.00001);
      }
    }
    // Make the occasional copy just to make sure copy() works.
    if (!(i & 0xfff)) {
      avg = avg.copy();
    }
  }
}

testCenterAverage(3, 0);
testCenterAverage(5, 1);
testCenterAverage(12, 1);
testCenterAverage(50, 3);
testCenterAverage(100, 5);
testCenterAverage(1000, 50);
console.log('PASS');
