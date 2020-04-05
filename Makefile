install:
	npm install
	npm run build
	npm publish --dry-run
	sudo npm link

help:
	npx babel-node src/bin/page-loader.js -h

start1:
	npx babel-node src/bin/page-loader.js https://ru.hexlet.io

start2:
	DEBUG=page-loader: npx babel-node src/bin/page-loader.js https://ru.hexlet.io

start3:
	DEBUG=* npx babel-node src/bin/page-loader.js https://ru.hexlet.io

install-deps:
	npm ci

build:
	rm -rf dist
	npm run build

test:
	npm test -- -u

test1:
	DEBUG=axios,page-loader:,tests: npm test -- -u

watch:
	npx jest --watch -u

watch1:
	DEBUG_COLORS=axios,page-loader:,tests: npx jest --watch -u

republish:
	sudo npm uninstall -g gendiff
	npm run build
	npm publish --dry-run
	sudo npm link

test-coverage:
	npm test -- --coverage -u

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
