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
  var sortedArray = new SortedArray();
  var array = [];
  for (var i = 0; i < numbers.length; ++i) {
    var remove;
    if (array.length === size) {
      remove = true;
    } else if (array.length === 0) {
      remove = false;
    } else {
      remove = ((numbers[i] & 1) === 0);
    }
    if (remove) {
      var idx = Math.floor(Math.random() * array.length);
      var value = array[idx];
      array.splice(idx, 1);
      sortedArray.remove(value);
    } else {
      var value = numbers[i];
      array.push(value);
      sortedArray.add(value);
      array.sort(function(a, b) {
        return a - b;
      });
    }
    assert.deepEqual(array, arrayValue(sortedArray));
  }
}

testForSize(1);
testForSize(50);
console.log('PASS');
