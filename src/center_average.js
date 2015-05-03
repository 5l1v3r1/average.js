// A CenterAverage is a rolling average which removes a certain number of the
// highest and lowest values and which always counts +Inf as a high value and
// -Inf as a low value.
//
// If there are more than numRemove values of +Inf or -Inf, the average is NaN.
function CenterAverage(size, numRemove) {
  this._size = size;
  this._numRemove = numRemove;

  this._posInfCount = 0;
  this._negInfCount = 0;

  this._average = new MovingAverage(size - numRemove*2);
  this._chronologicalTimes = new NumberStack(size);
  this._sortedTimes = new SortedArray();
}

// average returns the current average or NaN if there were not enough actual
// values.
CenterAverage.prototype.average = function() {
  if (Math.max(this._posInfCount, this._negInfCount) > this._numRemove ||
      this._sortedTimes.count() < this._size) {
    return NaN;
  } else {
    return this._average.average();
  }
};

// pushTime adds the next time to the rolling average and removes the very
// first time.
CenterAverage.prototype.pushTime = function(time) {
  this._removeOldestTime();

  // TODO: add the new time here.

  throw new Error('not yet implemented');
};

CenterAverage.prototype._removeOldestTime = function() {
  var oldTime = this._chronologicalTimes.shift();
  if (oldTime === Infinity) {
    --this._posInfCount;
  } else if (oldTime === -Infinity) {
    --this._negInfCount;
  }

  // this._average may have to be updated after removing the time, since
  // |LLL|MMMMMMMM|HHH| might have become |LLM|MMMMMMMH|HH | or
  // |LLL|MMMMMMMH|HH |. If it became |LLL|MMMMMMMM|HH |, nothing changed in the
  // middle.

  var removedIndex = this._sortedTimes.remove(oldTime);
  if (removedIndex < this._numRemove) {
    var newLowIndex = this._numRemove - 1;
    if (this._sortedTimes.count() > newLowIndex) {
      this._average.remove(this._sortedTimes.get(newLowIndex));
    }
  }
  if (removeIndex < this._size - this._numRemove) {
    var newMiddleIndex = this._size - this._numRemove - 1;
    if (this._sortedTimes.count() > newMiddleIndex) {
      this._average.add(this._sortedTimes.get(newMiddleIndex));
    }
  }
};

exports.CenterAverage = CenterAverage;
