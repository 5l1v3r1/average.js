// A SortedArray keeps an array of integers sorted. It treats DNF_TIME as
// positive infinity. This could be implemented as a binary tree in the
// future.
function SortedArray() {
  this._list = [];
}

SortedArray.prototype.add = function(value) {
  var idx = this._findIndex(value);
  this._list.splice(idx, 0, value);
};

SortedArray.prototype.count = function() {
  return this._list.length;
};

SortedArray.prototype.popWorst = function() {
  if (this._list.length === 0) {
    throw new Error('underflow');
  }
  return this._list.pop();
};

SortedArray.prototype.remove = function(value) {
  var idx = this._findValue(value);
  if (idx === this._list.length || this._list[idx] !== value) {
    return false;
  } else {
    this._list.splice(idx, 1);
    return true;
  }
};

SortedArray.prototype._endsWithDNF = function() {
  if (this._list.length > 0) {
    return this._list[this._list.length - 1] === DNF_TIME;
  } else {
    return false;
  }
};

SortedArray.prototype._findIndex = function(value) {
  if (value === DNF_TIME) {
    if (this._endsWithDNF()) {
      return this._list.length - 1;
    } else {
      return this._list.length;
    }
  }
  var begin = -1;
  var end = this._list.length;
  while (begin + 1 < end) {
    var idx = (begin + end) >> 1;
    var val = this._list[idx];
    if (val > value || val === DNF_TIME) {
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
