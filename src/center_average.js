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
  this._sortedValues = new SortedArray(size);
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

// integralValueForAverageBelow computes the highest positive integer value
// which could be passed to pushValue() while keeping the total average below a
// certain value.
// If no such integer exists, this returns NaN.
// If any integer value yields a satisfactory average, this returns Infinity.
CenterAverage.prototype.integralValueForAverageBelow = function(target) {
  // TODO: optimize this.

  if (this._sortedValues.count() < this._size-1) {
    return NaN;
  }

  var low = 0;
  var high = 1;

  // Verify that the lower bound even *works*.
  var tempCenter = this.copy();
  tempCenter.pushValue(low);
  var tempAvg = tempCenter.average();
  if (isNaN(tempAvg) || tempAvg >= target) {
    return NaN;
  }

  // Compute the upper bound.
  var i;
  for (i = 0; i < 51; ++i) {
    var newAverage = this.copy();
    newAverage.pushValue(high);
    var avg = newAverage.average();
    if (isNaN(avg)) {
      return NaN;
    } else if (avg >= target) {
      break;
    }
    high *= 2;
  }
  if (i === 51) {
    return Infinity;
  }

  while (low+1 < high) {
    var mid = Math.round((low + high) / 2);
    var newAverage = this.copy();
    newAverage.pushValue(mid);
    var avg = newAverage.average();
    if (isNaN(avg)) {
      throw new Error('impossible NaN result');
    }
    if (avg < target) {
      low = mid;
    } else if (avg >= target) {
      high = mid;
    }
  }

  if (high <= low) {
    throw new Error('impossible result from binary search');
  }

  return low;
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

// standardDeviation computes the standard deviation of the center values.
CenterAverage.prototype.standardDeviation = function() {
  var average = this.average();
  if (isNaN(average)) {
    return NaN;
  }
  var squareDiffs = 0;
  var max = this._size - this._numRemove;
  for (var i = this._numRemove; i < max; ++i) {
    squareDiffs += Math.pow(average - this._sortedValues.get(i), 2);
  }
  var variance = squareDiffs / (this._size - this._numRemove*2);
  return Math.sqrt(variance);
};

// valueNeededForAverage computes a value which could be passed to pushValue()
// in order to have a given average value. This returns NaN if such a number
// does not exist.
CenterAverage.prototype.valueNeededForAverage = function(requested) {
  if (this._sortedValues.count() < this._size-1) {
    return NaN;
  }

  // shiftedVersion will be missing exactly 1 value. Its state can be denoted as
  // [LLL...|MMMM...|HH... ] (note the missing H).
  var shiftedVersion = this;
  if (this._sortedValues.count() === this._size) {
    shiftedVersion = this.copy();
    shiftedVersion._removeOldestValue();
  }

  if (shiftedVersion._posInfCount > this._numRemove ||
      shiftedVersion._negInfCount > this._numRemove) {
    return NaN;
  }

  var average = shiftedVersion._average.average();
  var middleCount = this._size - this._numRemove*2;

  // If numRemove is 0, it is usually possible to get any value.
  if (this._numRemove === 0) {
    if (!isFinite(average)) {
      return NaN;
    }
    return (requested - average) * middleCount;
  }

  var highestMiddle = shiftedVersion._sortedValues.get(this._size -
    (this._numRemove + 1));
  if (isFinite(highestMiddle) && average === requested) {
    // [LLL|MMMX|HH ], (sum of M + X)/count = requested, so we just push X to
    // get [LLL|MMMX|XHH].
    return highestMiddle;
  } else {
    // [LLL|MMMX|HH ], L <= result < X
    var lowerBound = shiftedVersion._sortedValues.get(this._numRemove - 1);
    var mSum = average*middleCount;
    if (isFinite(highestMiddle)) {
      mSum -= highestMiddle;
    }
    var newValue = requested*middleCount - mSum;
    if (newValue < lowerBound || newValue > highestMiddle) {
      return NaN;
    } else {
      return newValue;
    }
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
