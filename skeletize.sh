#!/bin/bash

# This script encapsulates JavaScript code in a function.
# It provides the code with an exports variable which differs depending on the
# environment.

OUTNAME=build/average.js
VERSION=`cat VERSION`
LICENSE=`cat LICENSE | sed -e 's/^/\/\/ /g'`

echo "// average.js version $VERSION
//
$LICENSE
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
" >$OUTNAME

# Read the source file and indent it.
cat src/*.js | sed -e 's/^/  /g' | sed -e 's/[ \t]*$//g' >>$OUTNAME

echo "" >>$OUTNAME
echo "})();" >>$OUTNAME