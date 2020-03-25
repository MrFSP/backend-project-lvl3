install: install-deps

help:
	npx babel-node src/bin/page-loader.js -h

start1:
	npx babel-node src/bin/page-loader.js --output tmp https://expange.ru/

start2:
	npx babel-node src/bin/page-loader.js https://fonwall.ru

start3:
	npx babel-node src/bin/page-loader.js view-source:file:///Users/pavelegorov/projects/backend-project-lvl3/__tests__/__fixtures__/expected.test.html

start4:
	npx babel-node src/bin/page-loader.js https://ru.hexlet.io/courses

start5:
	DEBUG=axios,page-loader:,tests: npx babel-node src/bin/page-loader.js https://ru.hexlet.io

install-deps:
	npm ci

build:
	rm -rf dist
	npm run build

test:
	DEBUG=axios,page-loader:,tests: npm test -- -u

watch:
	DEBUG=axios,page-loader:,tests: npx jest --watch

republish:
	sudo npm uninstall -g gendiff
	npm run build
	npm publish --dry-run
	sudo npm link

test-coverage:
	npm test -- --coverage

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
