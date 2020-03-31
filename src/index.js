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

const HTMLtags = [
  ['link', 'href'],
  ['script', 'src'],
  ['img', 'src'],
];

let pathForHTML;
let dirNameForHTMLResouces;
let pathToDirForHTMLResourses;

const loadData = (url, pathToFile) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    log(`streaming ${url.href}`);
    response.data.pipe(createWriteStream(pathToFile));
  })
  .catch((e) => console.error(e.message));

const loadHTMLResources = (urls) => {
  const tasks = urls.map((currentURL) => ({
    title: currentURL.href,
    task: () => {
      const fileName = createName(currentURL.pathname);
      const pathToFile = path.join(pathToDirForHTMLResourses, fileName);
      loadData(currentURL, pathToFile);
    },
  }));
  new Listr(tasks, { concurrent: true, exitOnError: false }).run();
};

export default (url, pathToFile = process.cwd()) => Promise
  .all([axios.get(url), fs.stat(pathToFile)])
  .then(([response, stats]) => {
    const HTMLFileName = createName(url, '.html');
    const pathToDirWithHTML = stats.isDirectory()
      ? pathToFile
      : path.join(__dirname, '..', pathToFile);
    pathForHTML = `${pathToDirWithHTML}/${HTMLFileName}`;
    dirNameForHTMLResouces = createName(url, '_files');
    pathToDirForHTMLResourses = path.join(pathToDirWithHTML, dirNameForHTMLResouces);
    fs.mkdir(pathToDirForHTMLResourses).catch((e) => console.error(e.message));
    const HTMLContent = response.data;
    return HTMLContent;
  })
  .then((HTMLContent) => {
    const $ = cheerio.load(HTMLContent);
    const links = [];
    HTMLtags.forEach(([tag, attribute]) => {
      $(tag).each((i, elem) => {
        const link = $(elem).attr(attribute);
        if (link) {
          const newLink = path.join(dirNameForHTMLResouces, createName(link));
          $(elem).attr(attribute, newLink);
          links.push(link);
        }
      });
    });
    const changedHTML = $.html();
    const urls = _.uniq(links)
      .filter((link) => link !== '/')
      .map((link) => new URL(link, url));
    return [changedHTML, urls];
  })
  .then(([changedHTML, urls]) => Promise
    .all([fs.writeFile(pathForHTML, changedHTML), loadHTMLResources(urls)]))
  .then(() => log(`${url} loaded`))
  .catch((e) => {
    console.error(e.message);
    log(e.message);
    throw e;
  });
