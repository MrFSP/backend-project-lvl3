import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import cheerio from 'cheerio';
import path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import { createName } from './utils';

const log = debug('page-loader:');

const properties = [['link', 'href'], ['script', 'src'], ['img', 'src']];

let counterForEmptyNameFiles = 1;

const processHTML = (url, pathToFile, response, stats) => {
  const HTMLFileName = createName(url, '.html');
  const pathToDirWithHTML = stats.isDirectory() ? pathToFile : path.join(__dirname, '..', pathToFile);
  const pathToHTML = `${pathToDirWithHTML}/${HTMLFileName}`;
  const dirNameForFiles = createName(url, '_files');
  const pathToDirWithHTMLResourses = path.join(pathToDirWithHTML, dirNameForFiles);
  fs.mkdir(pathToDirWithHTMLResourses).catch((e) => console.error(e.message));
  const HTMLContent = response.data;
  const $ = cheerio.load(HTMLContent);
  const urls = [];
  properties.forEach(([tag, attribute]) => {
    $(tag).each((i, elem) => {
      const link = $(elem).attr(attribute);
      const currentURL = link ? new URL(link, url) : null;
      if (currentURL) {
        const newLink = path.join(dirNameForFiles, createName(currentURL.pathname));
        $(elem).attr(attribute, newLink);
      }
      return currentURL ? urls.push(currentURL) : null;
    });
  });
  const changedHTML = $.html();
  return [changedHTML, urls, pathToHTML, pathToDirWithHTMLResourses];
};

const loadData = (url, pathToDirWithHTMLResourses) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    const fileName = createName(url.pathname);
    const resultFileName = fileName !== '' ? fileName : `file${counterForEmptyNameFiles}`;
    counterForEmptyNameFiles += 1;
    const pathToFile = path.join(pathToDirWithHTMLResourses, resultFileName);
    log(`streaming ${url.href}`);
    response.data.pipe(createWriteStream(pathToFile));
  })
  .catch((e) => console.error(e.message));

export default (url, pathToFile = process.cwd()) => Promise
  .all([axios.get(url), fs.stat(pathToFile)])
  .then(([response, stats]) => processHTML(url, pathToFile, response, stats))
  .then(([changedHTML, urls, pathToHTML, pathToDirWithHTMLResourses]) => Promise.all([
    fs.writeFile(pathToHTML, changedHTML),
    urls.forEach((currentURL) => loadData(currentURL, pathToDirWithHTMLResourses)),
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
