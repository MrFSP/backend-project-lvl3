import path from 'path';

export default (url, needExt = false) => {
  const urlWithoutQuery = url.indexOf('?') !== -1
    ? url.split('?')[0]
    : url;
  const preparedurl = urlWithoutQuery.replace(/(https:\/\/)?/g, '')
    .replace(/[^\w]/g, '-')
    .split('-')
    .filter((i) => i !== '')
    .join('-');
  return needExt ? `${preparedurl}${path.extname(urlWithoutQuery)}` : preparedurl;
};
