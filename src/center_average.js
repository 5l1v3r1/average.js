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
// actual values.
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
  // TODO: this.
  throw new Error('not yet implemented');
};

exports.CenterAverage = CenterAverage;
