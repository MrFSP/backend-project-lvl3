import path from 'path';

export const createDirPath = (pathToFile) => path.join(__dirname, '..', pathToFile);

export const getFileName = (url, format) => {
  const exclusion = /https:\/\//;
  const symbolsToReplace = /[^a-z]/g;
  const name = url.replace(exclusion, '').replace(symbolsToReplace, '-');
  return format ? `${name}${format}` : `${name}`;
};
