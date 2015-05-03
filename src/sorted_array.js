// A SortedArray keeps an array of integers sorted. This could be implemented
// as a binary tree in the future, but for now it uses a simple JS array.
function SortedArray() {
  this._list = [];
}

// add inserts a value and returns the index it was inserted into.
SortedArray.prototype.add = function(value) {
  var idx = this._findIndex(value);
  this._list.splice(idx, 0, value);
  return idx;
};

// count returns the number of items in the list.
SortedArray.prototype.count = function() {
  return this._list.length;
};

// get returns the number at a given index.
SortedArray.prototype.get = function(index) {
  if (index < 0 || index >= this._list.length) {
    throw new Error('out of bounds');
  }
  return this._list[index];
};

// remove removes a value and returns the index where the value was. It returns
// -1 if the value was not found.
SortedArray.prototype.remove = function(value) {
  var idx = this._findValue(value);
  if (idx === this._list.length || this._list[idx] !== value) {
    return -1;
  } else {
    this._list.splice(idx, 1);
    return idx;
  }
};

SortedArray.prototype._findIndex = function(value) {
  var begin = -1;
  var end = this._list.length;
  while (begin + 1 < end) {
    var idx = (begin + end) >> 1;
    var val = this._list[idx];
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

exports.SortedArray = SortedArray;
