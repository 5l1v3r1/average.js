.PHONY: clean test

build/average.js: build
	sh skeletize.sh

build:
	mkdir build

clean:
	rm -rf build

bench: build/average.js
	sh bench.sh

test: build/average.js
	sh test.sh
