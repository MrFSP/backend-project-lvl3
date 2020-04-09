#!/usr/bin/env node

import program from 'commander';
import { version, description } from '../../package.json';
import loadPage from '..';

program
  .description(description)
  .version(`page-loader version: ${version}`, '-v, --version', 'output the version number')
  .option('-o, --output [pathToFile]', 'output path to file')
  .arguments('<url>')
  .action((url, option) => {
    loadPage(url, option.output)
      .then(() => {
        console.log(`Page '${url}' loaded`);
      })
      .catch((e) => {
        if (e.name === 'ListrError') {
          if (e.errors[0].errno === -3008) {
            console.error(`Resource not found. Url: ${e.errors[0].config.url}`);
          }
        } else if (e.message) {
          console.error(e.message);
        } else {
          console.error(e);
        }
      });
  })
  .parse(process.argv);
