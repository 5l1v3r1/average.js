var assert = require('assert');
var numbers = require('./rand.js');
var NumberStack = require('../build/average.js').NumberStack;

function testForCapacity(capacity) {
  var stack = [];
  var numStack = new NumberStack(capacity);
  for (var i = 0; i < numbers.length; ++i) {
    var remove;
    if (stack.length === capacity) {
      remove = true;
    } else if (stack.length === 0) {
      remove = false;
    } else {
      remove = ((numbers[i] & 1) === 0);
    }
    if (remove) {
      assert.equal(numStack.shift(), stack.shift());
    } else {
      numStack.push(numbers[i]);
      stack.push(numbers[i]);
    }
    assert.equal(numStack.count(), stack.length);
    for (var j = 0; j < stack.length; ++j) {
      assert.equal(numStack.get(j), stack[j]);
    }
  }
}

testForCapacity(1);
testForCapacity(50);
testForCapacity(100);
testForCapacity(1000000);
console.log('PASS');
