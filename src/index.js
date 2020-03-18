import axios from 'axios';
import { promises as fs } from 'fs';
import { getFileName, createDirPath } from './utils';

let completePath;

export default (url, pathToFile = process.cwd()) => Promise
  .all([axios.get(url), fs.stat(pathToFile)])
  .then(([response, stats]) => {
    const fileName = getFileName(url, '.html');
    const HTMLcontent = response.data;
    const dirPath = stats.isDirectory() ? pathToFile : createDirPath(pathToFile);
    completePath = `${dirPath}/${fileName}`;
    fs.writeFile(completePath, HTMLcontent);
  })
  .then(() => console.log(`Page uploaded and saved to file ${completePath}`))
  .catch((error) => {
    console.log(error);
  });
