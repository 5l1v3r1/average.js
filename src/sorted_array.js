// A SortedArray keeps an array of integers sorted. This could be implemented
// as a binary tree in the future, but for now it uses a simple JS array.
function SortedArray(size) {
  this._list = new NumberList(size);
}

// add inserts a value and returns the index it was inserted into.
SortedArray.prototype.add = function(value) {
  var idx = this._findIndex(value);
  this._list.insert(idx, value);
  return idx;
};

// count returns the number of items in the list.
SortedArray.prototype.count = function() {
  return this._list.count();
};

// copy duplicates the sorted array and returns the duplicate.
SortedArray.prototype.copy = function() {
  var res = new SortedArray();
  res._list = this._list.copy();
  return res;
};

// get returns the number at a given index.
SortedArray.prototype.get = function(index) {
  return this._list.get(index);
};

// remove removes a value and returns the index where the value was. It returns
// -1 if the value was not found.
SortedArray.prototype.remove = function(value) {
  var idx = this._findIndex(value);
  if (idx === this._list.count() || this._list.get(idx) !== value) {
    return -1;
  } else {
    this._list.remove(idx);
    return idx;
  }
};

SortedArray.prototype._findIndex = function(value) {
  var begin = -1;
  var end = this._list.count();
  while (begin + 1 < end) {
    var idx = (begin + end) >> 1;
    var val = this._list.get(idx);
    if (val > value) {
      end = idx;
    } else if (val < value) {
      begin = idx;
    } else {
      return idx;
    }
  }
  return begin + 1;
};

function NumberList(size) {
  this._array = [];
  this._size = size;
}

NumberList.prototype.copy = function() {
  var res = new NumberList(this._size);
  res._array = this._array.slice();
  return res;
};

NumberList.prototype.count = function() {
  return this._array.length;
};

NumberList.prototype.get = function(i) {
  if (i < 0 || i >= this._array.length) {
    throw new Error('out of bounds');
  }
  return this._array[i];
};

NumberList.prototype.insert = function(i, val) {
  this._array.splice(i, 0, val);
  if (this._array.length > this._size) {
    throw new Error('overflow ' + this._size);
  }
};

NumberList.prototype.remove = function(i) {
  this._array.splice(i, 1);
};

exports.SortedArray = SortedArray;
