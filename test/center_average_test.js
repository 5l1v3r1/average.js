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

function approxValueNeededForAverage(averager, requested) {
  // Find crude boundaries.
  var minimumValue = Math.pow(2, -64);
  var minimumAverage = NaN;
  var maximumValue = Math.pow(2, 64);
  var maximumAverage = NaN;
  for (var i = -63; i <= 63; ++i) {
    var value = Math.pow(2, i);
    var copy = averager.copy();
    copy.pushValue(value);
    var average = copy.average();
    if (isNaN(average)) {
      continue;
    }
    if ((isNaN(minimumAverage) || average > minimumAverage) &&
        average <= requested) {
      minimumValue = value;
      minimumAverage = average;
    }
    if ((isNaN(maximumAverage) || average < maximumAverage) &&
        average >= requested) {
      maximumValue = value;
      maximumAverage = average;
    }
  }

  if (isNaN(minimumAverage) && isNaN(maximumAverage)) {
    return NaN;
  }

  // Perform a binary search.
  for (var i = 0; i < 64 && minimumValue < maximumValue; ++i) {
    var value = (minimumValue + maximumValue) / 2;
    var copy = averager.copy();
    copy.pushValue(value);
    var average = copy.average();
    if (isNaN(average) || average > requested) {
      maximumValue = value;
    } else if (average < requested) {
      minimumValue = value;
    } else {
      return value;
    }
  }

  var result = (maximumValue + minimumValue) / 2;
  var resCopy = averager.copy();
  resCopy.pushValue(result);
  var resAverage = resCopy.average();
  if (Math.abs(resAverage - requested) > 0.0001) {
    return NaN;
  }
  return result;
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

function computeStandardDeviation(i, size, numRemove) {
  var subset = numbers.slice(i, i+size);
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
  var average = sum / (size - numRemove*2)

  var diffSquares = 0;
  for (var i = numRemove; i < size-numRemove; ++i) {
    diffSquares += Math.pow(subset[i] - average, 2);
  }
  return Math.sqrt(diffSquares / (size - numRemove*2));
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

function testStandardDeviation(size, numRemove) {
  for (var i = 0; i < numbers.length-size; i += size) {
    var avg = new CenterAverage(size, numRemove);
    for (var j = i; j < i+size; ++j) {
      avg.pushValue(numbers[j]);
    }
    var actual = avg.standardDeviation();
    var expected = computeStandardDeviation(i, size, numRemove);
    if (isNaN(actual) && isNaN(expected)) {
      continue;
    }
    assert.equal(isNaN(actual), isNaN(expected));
    assert(Math.abs(actual - expected) < 0.0001);
  }
}

function testValueNeededForAverage(size, numRemove) {
  var chunkSize = size + 1;
  for (var i = 0, max = numbers.length-chunkSize; i < max; i += chunkSize) {
    var requested = numbers[i + size];
    if (!isFinite(requested)) {
      break;
    }

    var average = new CenterAverage(size, numRemove);
    for (var j = i; j < i+size; ++j) {
      average.pushValue(numbers[j]);
    }
    var needed = average.valueNeededForAverage(requested);

    if (isNaN(needed)) {
      assert(isNaN(approxValueNeededForAverage(average, requested)));
      continue;
    }

    var copy = average.copy();
    copy.pushValue(needed);
    assert(Math.abs(copy.average() - requested) < 0.0001);
  }
}

var sizes = [3, 5, 12, 50, 100, 1000];
var numRemoves = [0, 1, 1, 3, 5, 50];
for (var i = 0; i < sizes.length; ++i) {
  var size = sizes[i];
  var numRemove = numRemoves[i];
  testCenterAverage(size, numRemove);
  testStandardDeviation(size, numRemove);
  testValueNeededForAverage(size, numRemove);
}
console.log('PASS');
