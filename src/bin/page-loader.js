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
      .catch((e) => {
        console.log(e.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
