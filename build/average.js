// average.js version 0.0.1
//
// Copyright (c) 2015, Alexander Nichol.
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer. 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//
(function() {
  var exports;
  if ('undefined' !== typeof window) {
    // Browser
    if (!window.averagejs) {
      window.averagejs = {};
    }
    exports = window.averagejs;
  } else if ('undefined' !== typeof self) {
    // WebWorker
    if (!self.averagejs) {
      self.averagejs = {};
    }
    exports = self.averagejs;
  } else if ('undefined' !== typeof module) {
    // Node.js
    if (!module.exports) {
      module.exports = {};
    }
    exports = module.exports;
  }

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
    var wasFullBeforeAddition = (this._sortedTimes.count() === this._size);
    if (wasFullBeforeAddition) {
      this._removeOldestTime();
    }

    this._chronologicalTimes.push(time);
    if (time === Infinity) {
      ++this._posInfCount;
    } else if (time === -Infinity) {
      ++this._negInfCount;
    }
    var idx = this._sortedTimes.add(time);

    if (this._sortedTimes.count() < this._size) {
      return;
    } else if (!wasFullBeforeAddition) {
      this._computeFirstAverage();
      return;
    }

    if (idx >= this._numRemove && idx < this._size - this._numRemove) {
      // |LLL|MMMM|HH | -> |LLL|MMMM|MHH|.
      this._average.add(time);
    }
    if (idx < this._numRemove) {
      // |LLL|MMMM|HH | -> |LLL|LMMM|MHH|
      this._average.add(this._sortedTimes.get(this._numRemove));
    }
    if (idx < this._size - this._numRemove && this._numRemove > 0) {
      // |LLL|MMMM|HH | -> either |LLL|LMMM|MHH| or |LLL|MMMM|MHH|
      this._average.remove(this._sortedTimes.get(this._size - this._numRemove));
    }
  };

  CenterAverage.prototype._computeFirstAverage = function() {
    for (var i = this._numRemove; i < this._size-this._numRemove; ++i) {
      this._average.add(this._sortedTimes.get(i));
    }
  };

  CenterAverage.prototype._removeOldestTime = function() {
    var oldTime = this._chronologicalTimes.shift();
    if (oldTime === Infinity) {
      --this._posInfCount;
    } else if (oldTime === -Infinity) {
      --this._negInfCount;
    }

    // this._average may have to be updated after removing the time, since
    // |LLL|MMMMMMMM|HHH| might have become |LLM|MMMMMMMH|HH | (deleted an L) or
    // |LLL|MMMMMMMH|HH | (deleted an M). If it became |LLL|MMMMMMMM|HH |
    // (deleted an H), nothing changed in the average.

    var removedIndex = this._sortedTimes.remove(oldTime);
    if (removedIndex >= this._numRemove &&
        removedIndex < this._size - this._numRemove) {
      this._average.remove(oldTime);
    }
    if (removedIndex < this._numRemove) {
      var newLowIndex = this._numRemove - 1;
      if (this._sortedTimes.count() > newLowIndex) {
        this._average.remove(this._sortedTimes.get(newLowIndex));
      }
    }
    if (removedIndex < this._size - this._numRemove && this._numRemove > 0) {
      var newMiddleIndex = this._size - this._numRemove - 1;
      if (this._sortedTimes.count() > newMiddleIndex) {
        this._average.add(this._sortedTimes.get(newMiddleIndex));
      }
    }
  };

  exports.CenterAverage = CenterAverage;
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
  // A NumberStack is a list of numbers with a constant size and O(1) push and
  // shift time.
  function NumberStack(capacity) {
    this._array = [];
    this._start = 0;
    this._end = 0;
    this._count = 0;
    for (var i = 0; i < capacity; ++i) {
      this._array[i] = 0;
    }
  }

  NumberStack.prototype.count = function() {
    return this._count;
  };

  NumberStack.prototype.get = function(idx) {
    if (idx < 0 || idx >= this._count) {
      throw new Error('index out of bounds: ' + idx);
    }
    return this._array[(idx + this._start) % this._array.length];
  };

  NumberStack.prototype.push = function(number) {
    if (this._count === this._array.length) {
      throw new Error('overflow');
    }
    ++this._count;
    this._array[this._end++] = number;
    if (this._end === this._array.length) {
      this._end = 0;
    }
  };

  NumberStack.prototype.shift = function() {
    if (this._count === 0) {
      throw new Error('underflow');
    }
    --this._count;
    var res = this._array[this._start++];
    if (this._start === this._array.length) {
      this._start = 0;
    }
    return res;
  };

  exports.NumberStack = NumberStack;
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
    var idx = this._findIndex(value);
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

})();
