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
  const urls = [];
  Object.entries(htmlTags).forEach(([tag, attribute]) => {
    $(tag).each((i, elem) => {
      const link = $(elem).attr(attribute);
      if (link === '/' || !link) {
        return;
      }
      const newurl = new URL(link, url);
      urls.push(newurl);
      const newLink = path.join(dirNameForhtmlResouces, createName(newurl.pathname));
      $(elem).attr(attribute, newLink);
      links.push(link);
    });
  });
  const changedhtml = $.html();
  return [changedhtml, _.uniq(urls)];
};

const loadData = (url, pathToFile) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    response.data.pipe(createWriteStream(pathToFile));
  });

const loadhtmlResources = (urls) => {
  const tasks = [];
  urls.forEach((currentURL) => tasks.push({
    title: currentURL.href,
    task: () => {
      log(`streaming ${currentURL.href}`);
      const fileName = createName(currentURL.pathname);
      const pathToFile = path.join(pathToDirForhtmlResourses, fileName);
      return loadData(currentURL, pathToFile);
    },
  }));
  return tasks;
};

export default (url, pathToFile = process.cwd()) => axios.get(url)
  .then((response) => {
    const htmlFileName = createName(url, '.html');
    pathForhtml = `${pathToFile}/${htmlFileName}`;
    dirNameForhtmlResouces = createName(url, '_files');
    pathToDirForhtmlResourses = path.join(pathToFile, dirNameForhtmlResouces);
    return processhtml(url, response.data);
  })
  .then(([changedhtml, urls]) => {
    const htmltask = {
      title: url,
      task: () => fs.writeFile(pathForhtml, changedhtml),
    };
    return fs.mkdir(pathToDirForhtmlResourses)
      .then(() => loadhtmlResources(urls))
      .then((tasks) => new Listr(
        [htmltask, ...tasks],
        { concurrent: true, exitOnError: false },
      ).run())
      .then(() => log(`${url} loaded`));
  });
