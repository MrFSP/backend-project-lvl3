#!/usr/bin/env node

import program from 'commander';
import { version, description } from '../../package.json';
import pageLoader from '..';

program
  .description(description)
  .version(`page-loader version: ${version}`, '-v, --version', 'output the version number')
  .option('-o, --output [pathToFile]', 'output path to file')
  .arguments('<url>')
  .action((url, option) => pageLoader(url, option.output))
  .parse(process.argv);
