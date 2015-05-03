var assert = require('assert');
var numbers = require('./rand.js');
var MovingAverage = require('../build/average.js').MovingAverage;

function computeAverage(numbers) {
  var sum = 0;
  for (var i = 0; i < numbers.length; ++i) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}

function testForSize(averageSize) {
  var moving = new MovingAverage(averageSize);
  for (var i = 0; i < numbers.length - averageSize; ++i) {
    moving.add(numbers[i]);
    if (i >= averageSize) {
      moving.remove(numbers[i - averageSize]);
    } else if (i < averageSize - 1) {
      continue;
    }
    var actualValue = moving.average();
    var expectedValue = computeAverage(numbers.slice(i-averageSize+1, i+1));
    var error = Math.abs(actualValue - expectedValue);
    assert(error < 0.00001, 'values are not close enough');
  }
}

for (var size = 1; size < 15; ++size) {
  testForSize(size);
}
testForSize(50);
testForSize(100);
testForSize(1000);
console.log('PASS');
