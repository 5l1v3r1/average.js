var assert = require('assert');
var numbers = require(__dirname + '/rand.js').slice(0, 2000);
var MovingAverage = require(__dirname + '/../build/average.js').MovingAverage;

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
    var error = Math.abs((actualValue - expectedValue) / actualValue);
    if (error > 0.00001) {
      throw new Error('values are not close enough');
    }
  }
}

for (var size = 0; size < 15; ++size) {
  testForSize(size);
}
testForSize(50);
testForSize(100);
testForSize(1000);
console.log('PASS');