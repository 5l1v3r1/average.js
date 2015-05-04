#!/bin/bash
#
# This script runs all the benchmark files.
#

for f in bench/*_bench.js
do
  echo
  echo RUNNING BENCHMARK: $f
  node $f || exit
done
