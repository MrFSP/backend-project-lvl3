import path from 'path';

export const createPathToDir = (pathToFile) => path.join(__dirname, pathToFile);

export const createName = (url, ext = '') => {
  const replacer = (str) => str.replace(/https:\/\//g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/(-+)/g, '-')
    .replace(/(-+$|^-+)/g, '')
    .substr(0, 40);
  // console.log('url before: ', url);
  // console.log('url has ?: ', url.indexOf('?') !== -1);
  let result = url.indexOf('?') !== -1 ? url.replace(/[^\\?]*$/g, '') : url;
  // console.log('url after: ', result);
  if (result.indexOf('.')) {
    const groups = result.split('.');
    const currentExt = groups[groups.length - 1];
    const firstPart = result.replace(currentExt, '');
    result = `${replacer(firstPart)}${ext === '' ? '.' : '-'}${replacer(currentExt)}${ext}`;
  } else {
    result = `${replacer(result)}${ext}`;
  }
  return result.replace(/(^([^\w])|([^\w])$)/g, '');
};
