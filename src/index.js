import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import cheerio from 'cheerio';
import path from 'path';
import Listr from 'listr';
import { promises as fs, createWriteStream } from 'fs';
import { createName } from './utils';

const log = debug('page-loader:');

const HTMLtags = [
  ['link', 'href'],
  ['script', 'src'],
  ['img', 'src'],
];

const processHTML = (url, pathToFile, response, stats) => {
  const HTMLFileName = createName(url, '.html');
  const pathToDirWithHTML = stats.isDirectory() ? pathToFile : path.join(__dirname, '..', pathToFile);
  const pathForHTML = `${pathToDirWithHTML}/${HTMLFileName}`;
  const dirNameForHTMLResouces = createName(url, '_files');
  const pathToDirForHTMLResourses = path.join(pathToDirWithHTML, dirNameForHTMLResouces);
  fs.mkdir(pathToDirForHTMLResourses).catch((e) => console.error(e.message));
  const HTMLContent = response.data;
  const $ = cheerio.load(HTMLContent);
  const urls = [];
  HTMLtags.forEach(([tag, attribute]) => {
    $(tag).each((i, elem) => {
      const link = $(elem).attr(attribute);
      const currentURL = link ? new URL(link, url) : null;
      if (currentURL) {
        const newLink = path.join(dirNameForHTMLResouces, createName(currentURL.pathname));
        $(elem).attr(attribute, newLink);
      }
      return currentURL ? urls.push(currentURL) : null;
    });
  });
  const changedHTML = $.html();
  return [changedHTML, urls, pathForHTML, pathToDirForHTMLResourses];
};

const loadData = (url, pathToDirForHTMLResourses) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    const fileName = createName(url.pathname);
    const pathToFile = path.join(pathToDirForHTMLResourses, fileName);
    log(`streaming ${url.href}`);
    response.data.pipe(createWriteStream(pathToFile));
  })
  .catch((e) => console.error(e.message));

const loadHTMLResources = (urls, pathToDir) => {
  const tasks = urls.map((currentURL) => ({
    title: currentURL.href,
    task: () => loadData(currentURL, pathToDir),
  }));
  new Listr(tasks, { concurrent: true, exitOnError: false }).run();
};

export default (url, pathToFile = process.cwd()) => Promise
  .all([axios.get(url), fs.stat(pathToFile)])
  .then(([response, stats]) => processHTML(url, pathToFile, response, stats))
  .then(([changedHTML, urls, pathForHTML, pathToDirForHTMLResourses]) => Promise
    .all([
      fs.writeFile(pathForHTML, changedHTML), loadHTMLResources(urls, pathToDirForHTMLResourses),
    ]))
  .then(() => {
    log(`${url} loaded`);
    console.log(`Page '${url}' loaded`);
  })
  .catch((e) => {
    console.error(e.message);
    log(e.message);
    throw e;
  });
