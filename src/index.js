import axios from 'axios';
import debug from 'debug';
import cheerio from 'cheerio';
import path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import { createName } from './utils';

const properties = [['link', 'href'], ['script', 'src'], ['img', 'src']];

let pathToHTML;
let dirNameForFiles;
let HTMLContent;
let pathToDirWithHTMLResourses;
let counterForEmptyNameFiles = 1;
const urls = [];

const loadData = (url) => axios({
  method: 'get',
  url: url.href,
  responseType: 'stream',
})
  .then((response) => {
    const fileName = createName(url.pathname);
    const resultFileName = fileName !== '' ? fileName : `file${counterForEmptyNameFiles}`;
    counterForEmptyNameFiles += 1;
    const pathToFile = path.join(pathToDirWithHTMLResourses, resultFileName);
    response.data.pipe(createWriteStream(pathToFile));
  });

export default (url, pathToFile = process.cwd()) => Promise
  .all([axios.get(url), fs.stat(pathToFile)])
  .then(([response, stats]) => {
    const HTMLFileName = createName(url, '.html');
    const pathToDirWithHTML = stats.isDirectory() ? pathToFile : path.join(__dirname, '..', pathToFile);
    pathToHTML = `${pathToDirWithHTML}/${HTMLFileName}`;
    HTMLContent = response.data;
    dirNameForFiles = createName(url, '_files');
    pathToDirWithHTMLResourses = path.join(pathToDirWithHTML, dirNameForFiles);
    fs.mkdir(pathToDirWithHTMLResourses);
  })
  .then(() => {
    const $ = cheerio.load(HTMLContent);
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
    HTMLContent = $.html();
  })
  .then(() => urls.forEach((currentURL) => loadData(currentURL)))
  .then(() => fs.writeFile(pathToHTML, HTMLContent))
  .then(() => console.log(`Page loaded and saved to file ${pathToHTML}`))
  .catch((e) => {
    console.error(e);
  });
