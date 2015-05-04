// A CenterAverage is a rolling average which removes a certain number of the
// highest and lowest values and which always counts +Inf as a high value and
// -Inf as a low value.
//
// If there are more than numRemove values of +Inf or -Inf, the average is NaN.
function CenterAverage(size, numRemove) {
  if (numRemove*2 >= size) {
    throw new Error('numRemove is too large');
  }

  this._size = size;
  this._numRemove = numRemove;

  this._posInfCount = 0;
  this._negInfCount = 0;

  this._average = new MovingAverage(size - numRemove*2);
  this._chronologicalValues = new NumberStack(size);
  this._sortedValues = new SortedArray();
}

// average returns the current average or NaN if there were not enough actual
// values.
CenterAverage.prototype.average = function() {
  if (Math.max(this._posInfCount, this._negInfCount) > this._numRemove ||
      this._sortedValues.count() < this._size) {
    return NaN;
  } else {
    return this._average.average();
  }
};

// copy generates a copy of the CenterAverage in this current state.
CenterAverage.prototype.copy = function() {
  var res = new CenterAverage(this._size, this._numRemove);
  res._posInfCount = this._posInfCount;
  res._negInfCount = this._negInfCount;
  res._average = this._average.copy();
  res._chronologicalValues = this._chronologicalValues.copy();
  res._sortedValues = this._sortedValues.copy();
  return res;
};

// pushValue adds the next value to the rolling average and removes the very
// first value.
CenterAverage.prototype.pushValue = function(value) {
  var wasFullBeforeAddition = (this._sortedValues.count() === this._size);
  if (wasFullBeforeAddition) {
    this._removeOldestValue();
  }

  this._chronologicalValues.push(value);
  if (value === Infinity) {
    ++this._posInfCount;
  } else if (value === -Infinity) {
    ++this._negInfCount;
  }
  var idx = this._sortedValues.add(value);

  if (this._sortedValues.count() < this._size) {
    return;
  } else if (!wasFullBeforeAddition) {
    this._computeFirstAverage();
    return;
  }

  if (idx >= this._numRemove && idx < this._size - this._numRemove) {
    // |LLL|MMMM|HH | -> |LLL|MMMM|MHH|.
    this._average.add(value);
  }
  if (idx < this._numRemove) {
    // |LLL|MMMM|HH | -> |LLL|LMMM|MHH|
    this._average.add(this._sortedValues.get(this._numRemove));
  }
  if (idx < this._size - this._numRemove && this._numRemove > 0) {
    // |LLL|MMMM|HH | -> either |LLL|LMMM|MHH| or |LLL|MMMM|MHH|
    this._average.remove(this._sortedValues.get(this._size - this._numRemove));
  }
};

CenterAverage.prototype._computeFirstAverage = function() {
  for (var i = this._numRemove; i < this._size-this._numRemove; ++i) {
    this._average.add(this._sortedValues.get(i));
  }
};

CenterAverage.prototype._removeOldestValue = function() {
  var oldValue = this._chronologicalValues.shift();
  if (oldValue === Infinity) {
    --this._posInfCount;
  } else if (oldValue === -Infinity) {
    --this._negInfCount;
  }

  // this._average may have to be updated after removing the value, since
  // |LLL|MMMMMMMM|HHH| might have become |LLM|MMMMMMMH|HH | (deleted an L) or
  // |LLL|MMMMMMMH|HH | (deleted an M). If it became |LLL|MMMMMMMM|HH |
  // (deleted an H), nothing changed in the average.

  var removedIndex = this._sortedValues.remove(oldValue);
  if (removedIndex >= this._numRemove &&
      removedIndex < this._size - this._numRemove) {
    this._average.remove(oldValue);
  }
  if (removedIndex < this._numRemove) {
    var newLowIndex = this._numRemove - 1;
    if (this._sortedValues.count() > newLowIndex) {
      this._average.remove(this._sortedValues.get(newLowIndex));
    }
  }
  if (removedIndex < this._size - this._numRemove && this._numRemove > 0) {
    var newMiddleIndex = this._size - this._numRemove - 1;
    if (this._sortedValues.count() > newMiddleIndex) {
      this._average.add(this._sortedValues.get(newMiddleIndex));
    }
  }
};

exports.CenterAverage = CenterAverage;
