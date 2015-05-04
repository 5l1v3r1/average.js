// A NumberStack is a list of numbers with a constant size and O(1) push and
// shift time.
function NumberStack(capacity) {
  this._array = [];
  this._start = 0;
  this._end = 0;
  this._count = 0;
  for (var i = 0; i < capacity; ++i) {
    this._array[i] = 0;
  }
}

NumberStack.prototype.copy = function() {
  var res = new NumberStack(0);
  res._array = this._array.slice();
  res._start = this._start;
  res._end = this._end;
  res._count = this._count;
  return res;
};

NumberStack.prototype.count = function() {
  return this._count;
};

NumberStack.prototype.get = function(idx) {
  if (idx < 0 || idx >= this._count) {
    throw new Error('index out of bounds: ' + idx);
  }
  return this._array[(idx + this._start) % this._array.length];
};

NumberStack.prototype.push = function(number) {
  if (this._count === this._array.length) {
    throw new Error('overflow');
  }
  ++this._count;
  this._array[this._end++] = number;
  if (this._end === this._array.length) {
    this._end = 0;
  }
};

NumberStack.prototype.shift = function() {
  if (this._count === 0) {
    throw new Error('underflow');
  }
  --this._count;
  var res = this._array[this._start++];
  if (this._start === this._array.length) {
    this._start = 0;
  }
  return res;
};

exports.NumberStack = NumberStack;
