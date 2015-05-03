.PHONY: clean test

build/average.js: build
	sh skeletize.sh

build:
	mkdir build

clean:
	rm -rf build

test: build/average.js
	sh test.sh
