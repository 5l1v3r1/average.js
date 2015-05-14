// A SortedArray keeps an array of integers sorted. This could be implemented
// as a binary tree in the future, but for now it uses a simple JS array.
function SortedArray(size) {
  this._list = new BisectedNumberList(size);
}

// add inserts a value and returns the index it was inserted into.
SortedArray.prototype.add = function(value) {
  var idx = this._findIndex(value);
  this._list.insert(idx, value);
  return idx;
};

// copy duplicates the sorted array and returns the duplicate.
SortedArray.prototype.copy = function() {
  var res = new SortedArray();
  res._list = this._list.copy();
  return res;
};

// count returns the number of items in the list.
SortedArray.prototype.count = function() {
  return this._list.count();
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

function BisectedNumberList(size) {
  this._lower = [];
  this._upper = [];
  this._lowerSize = (size >>> 1);
  this._upperSize = size - this._lowerSize;
}

BisectedNumberList.prototype.copy = function() {
  var res = new BisectedNumberList(this._lowerSize + this._upperSize);
  res._lower = this._lower.slice();
  res._upper = this._upper.slice();
  return res;
};

BisectedNumberList.prototype.count = function() {
  return this._lower.length + this._upper.length;
};

BisectedNumberList.prototype.get = function(i) {
  if (i < 0) {
    throw new Error('out of bounds');
  }
  if (i < this._lowerSize) {
    if (i >= this._lower.length) {
      throw new Error('out of bounds');
    }
    return this._lower[i];
  } else {
    var idx = i - this._lowerSize;
    if (idx >= this._upper.length) {
      throw new Error('out of bounds');
    }
    return this._upper[this._upper.length - (idx + 1)];
  }
};

BisectedNumberList.prototype.insert = function(i, val) {
  if (i < 0) {
    throw new Error('out of bounds');
  }
  if (i < this._lowerSize) {
    if (this._lower.length === this._lowerSize) {
      this._upper.push(this._lower.pop());
    }
    this._lower.splice(i, 0, val);
  } else {
    var idx = this._upper.length - (i - this._lowerSize);
    this._upper.splice(idx, 0, val);
  }
  if (this._upper.length > this._upperSize) {
    throw new Error('overflow');
  }
};

BisectedNumberList.prototype.remove = function(i) {
  if (i < this._lowerSize) {
    this._lower.splice(i, 1);
    if (this._upper.length > 0) {
      this._lower.push(this._upper.pop());
    }
  } else {
    var idx = this._upper.length - (i - this._lowerSize) - 1;
    this._upper.splice(idx, 1);
  }
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
