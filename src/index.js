import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import cheerio from 'cheerio';
import path from 'path';
import Listr from 'listr';
import _ from 'lodash';
import { promises as fs, createWriteStream } from 'fs';
import { createName } from './utils';

const log = debug('page-loader:');

const htmlTags = { link: 'href', script: 'src', img: 'src' };

let pathForhtml;
let dirNameForhtmlResouces;
let pathToDirForhtmlResourses;

const processhtml = (url, htmlContent) => {
  const $ = cheerio.load(htmlContent);
  const links = [];
  Object.entries(htmlTags).forEach(([tag, attribute]) => {
    $(tag).each((i, elem) => {
      const link = $(elem).attr(attribute);
      if (link) {
        const newLink = path.join(dirNameForhtmlResouces, createName(link));
        $(elem).attr(attribute, newLink);
        links.push(link);
      }
    });
  });
  const changedhtml = $.html();
  const urls = _.uniq(links)
    .filter((link) => link !== '/')
    .map((link) => new URL(link, url));
  return [changedhtml, urls];
};

const loadData = (url, pathToFile) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    log(`streaming ${url.href}`);
    response.data.pipe(createWriteStream(pathToFile));
  });

const loadhtmlResources = (urls) => {
  const tasks = urls.map((currentURL) => ({
    title: currentURL.href,
    task: () => {
      const fileName = createName(currentURL.pathname);
      const pathToFile = path.join(pathToDirForhtmlResourses, fileName);
      return loadData(currentURL, pathToFile);
    },
  }));
  return new Listr(tasks, { concurrent: true, exitOnError: false }).run();
};

export default (url, pathToFile = process.cwd()) => axios.get(url)
  .then((response) => {
    const htmlFileName = createName(url, '.html');
    pathForhtml = `${pathToFile}/${htmlFileName}`;
    dirNameForhtmlResouces = createName(url, '_files');
    pathToDirForhtmlResourses = path.join(pathToFile, dirNameForhtmlResouces);
    return processhtml(url, response.data);
  })
  .then(([changedhtml, urls]) => Promise
    .all([
      fs.writeFile(pathForhtml, changedhtml)
        .then(() => log(`${url} loaded`)),
      fs.mkdir(pathToDirForhtmlResourses)
        .then(() => loadhtmlResources(urls))
        .then(() => log('Resources loaded')),
    ]));
