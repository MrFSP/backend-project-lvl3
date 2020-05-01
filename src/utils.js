export default (url, changePoints = false) => {
  const replacer = changePoints ? /[^\w]/g : /[^\w.]/g;
  return url.replace(replacer, '-')
    .split('-')
    .filter((i) => i !== '')
    .join('-');
};
