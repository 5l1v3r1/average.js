#!/bin/bash
#
# This script runs all the test files.
#

for f in test/*_test.js
do
  echo
  echo RUNNING TEST: $f
  node $f || exit
done
