import path from 'path';

export const createPathToDir = (pathToFile) => path.join(__dirname, pathToFile);

export const createName = (url, ext = '') => {
  const replace = (str) => str.replace(/https:\/\//g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/(-+)/g, '-')
    .replace(/(-+$|^-+)/g, '')
    .substr(0, 35);

  let result;
  if (url.indexOf('.')) {
    const groups = url.split('.');
    const currentExt = groups[groups.length - 1];
    const firstPart = url.replace(currentExt, '');
    result = `${replace(firstPart)}${ext === '' ? '.' : '-'}${replace(currentExt)}${ext}`;
  } else {
    result = `${replace(url)}${ext}`;
  }
  return result.replace(/(^([^\w])|([^\w])$)/g, '');
};
