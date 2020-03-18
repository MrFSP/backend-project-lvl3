install: install-deps

help:
	npx babel-node src/bin/page-loader.js -h

start1:
	npx babel-node src/bin/page-loader.js --output /home/mrfsp/projects/backend-project-lvl3/tmp/ https://ru.hexlet.io/courses

start2:
	npx babel-node src/bin/page-loader.js https://ru.hexlet.io/courses

install-deps:
	npm ci

build:
	rm -rf dist
	npm run build

test:
	npm test

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
