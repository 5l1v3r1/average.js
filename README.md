# average.js

**average.js** is a JavaScript API for computing rolling averages of large data sets. It is designed to be used in cube timers such as [Cubezapp](https://github.com/unixpickle/cubezapp2).

# Building

To build average.js, you will need `make`, `bash`, and a few other common UNIX commands. Now, you can generate a file called **build/average.js** using make:

    make

# Tests & Benchmarks

You can run tests using `make test` and benchmarks using `make bench`. You will need Node.js to run these.

# Usage

In Node.js, you can access the average.js API by importing the **build/average.js** file after you have built the project.  In the browser, you should use a &lt;script&gt; tag to import **build/average.js** and then access the API through `window.averagejs`.

The API contains a number of classes which you can access as properties. Of these, the `CenterAverage` class the most significant.

## CenterAverage

This class computes a rolling average of X values while removing the N lowest and N highest values. It also supports values of `Infinity` and `-Infinity`.

The `CenterAverage` constructor takes two arguments, `size` and `numRemove`. The window size for the average is `size`, and from this window `numRemove` low values and `numRemove` high values are removed for each average.

The class implements the following methods:

 * average() - number - get the current average. If no average is available, or if the average contains infinite values, NaN is returned.
 * copy() - CenterAverage - create a deep copy of this average.
 * integralValueForAverageBelow(number) - number - compute a positive integer value which could be supplied to pushValue() in order for the next average() to be less than the passed value. If no such value exists, this returns NaN. If all positive integers meet the criterion, this returns Infinity.
 * pushValue(number) - void - add a new value to the rolling average. If the window was full, this will consequently remove the oldest value from the window.
 * standardDeviation() - number - get the standard deviation of the times in the window, excluding the lowest and highest values which were omitted from the average.
 * valueNeededForAverage(number) - number - compute a value which could be supplied to pushValue() in order for the next average() to be the passed value. If no value exists, this returns NaN.

# License

See [LICENSE](LICENSE)
