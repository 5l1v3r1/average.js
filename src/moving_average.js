// A MovingAverage computes an average on the fly.
function MovingAverage(count) {
  this._count = count;
  this._value = 0;
}

MovingAverage.prototype.add = function(val) {
  if (!isFinite(val) || isNaN(val)) {
    return;
  }
  this._value += val;
};

MovingAverage.prototype.average = function() {
  return this._value / this._count;
};

MovingAverage.prototype.remove = function(val) {
  if (!isFinite(val) || isNaN(val)) {
    return;
  }
  this._value -= val;
};

exports.MovingAverage = MovingAverage;