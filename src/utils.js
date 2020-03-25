import path from 'path';

export const createPathToDir = (pathToFile) => path.join(__dirname, pathToFile);

export const createName = (url, ext = '') => {
  const replacer = (str) => str.replace(/https:\/\//g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/(-+)/g, '-')
    .replace(/(-+$|^-+)/g, '')
    .substr(0, 40);

  let result;
  if (url.indexOf('.')) {
    const groups = url.split('.');
    const currentExt = groups[groups.length - 1];
    const firstPart = url.replace(currentExt, '');
    result = `${replacer(firstPart)}${ext === '' ? '.' : '-'}${replacer(currentExt)}${ext}`;
  } else {
    result = `${replacer(url)}${ext}`;
  }
  return result.replace(/(^([^\w])|([^\w])$)/g, '');
};
