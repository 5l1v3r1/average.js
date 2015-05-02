// An UnfilteredAverage is a rolling average which removes a certain number of
// best and worst times and which always counts DNFs as bad times.
function UnfilteredAverage(size, numRemove) {
  this._size = size;
  this._numRemove = numRemove;

  this._dnfCount = 0;

  this._average = new MovingAverage(size - numRemove*2);
  this._times = new NumberStack(size);
  this._best = new SortedArray();
  this._middle = new SortedArray();
  this._worst = new SortedArray();
}

// average returns the current average or -1 if the average is a DNF.
UnfilteredAverage.prototype.average = function() {
  if (this._dnfCount > this._numRemove) {
    return -1;
  }
  return this._average.average();
};

// pushTime adds the next time to the rolling average and removes the very
// first time.
UnfilteredAverage.prototype.pushTime = function(time) {
  this._shiftTime();
  this._times.push(time);
  if (time === DNF_TIME) {
    ++this._dnfCount;
  }

  this._best.add(time);
  this._balanceData();
};

UnfilteredAverage.prototype._balanceData = function() {
  while (this._best.count() > this._numRemove) {
    var time = this._best.popWorst();
    this._middle.add(time);
    this._average.add(time);
  }
  var middleCapacity = this._size - this._numRemove*2;
  while (this._middle.count() > middleCapacity) {
    var time = this._middle.popWorst();
    this._average.remove(time);
    this._worst.add(time);
  }
};

UnfilteredAverage.prototype._shiftTime = function() {
  if (this._times.count() < this._size) {
    return;
  }

  var time = this._times.shift();
  if (time === DNF_TIME) {
    --this._dnfCount;
  }

  if (!this._middle.remove(time)) {
    if (!this._best.remove(time)) {
      if (!this._worst.remove(time)) {
        throw new Error('time was not in any table');
      }
    }
  } else {
    this._average.remove(time);
  }
};

// A FilteredAverage is a rolling average which completely ignores DNFs.
function FilteredAverage(size, numRemove) {
  UnfilteredAverage.call(this, size, numRemove);
}

FilteredAverage.prototype = Object.create(UnfilteredAverage.prototype);

FilteredAverage.prototype.pushTime = function(time) {
  if (time !== DNF_TIME) {
    UnfilteredAverage.prototype.pushTime.call(this, time);
  }
};

exports.UnfilteredAverage = UnfilteredAverage;
exports.FilteredAverage = FilteredAverage;
