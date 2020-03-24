import { promises as fs } from 'fs';
import nock from 'nock';
import debug from 'debug';
import os from 'os';
import path from 'path';
import _ from 'lodash';
import loadPage from '../src';
import { createName } from '../src/utils';

nock.disableNetConnect();

const log = debug('tests:');

const origin = 'https://testpage.ru';

const dirNameForFiles = createName(origin, '_files');

const urls = {
  root: new URL('https://testpage.ru'),
  script: new URL('https://testpage.ru/script'),
  link: new URL('https://testpage.ru/href/file.css'),
  img: new URL('https://testpage.ru/src!@$%&*()image.jpeg'),
};

const typesOfResources = Object.keys(urls);

let fixtureData;
let pathToTempDir;
let pathToLoadedHTML;
let pathToTempDirWithFiles;
let changedHTMLData;

const createPathToFixture = (...args) => path.join(__dirname, '__fixtures__', args.join('/'));

const getPathFixture = (url) => {
  const isRootURL = url.pathname === '/';
  const pathname = !isRootURL ? url.pathname : url.origin;
  const fileName = createName(pathname, !isRootURL ? '' : '.html');
  return createPathToFixture(!isRootURL ? dirNameForFiles : '', fileName);
};

beforeAll(async () => {
  const pathToChangedHTML = createPathToFixture('changed-testpage-ru.html');
  changedHTMLData = await fs.readFile(pathToChangedHTML, 'utf-8');
  fixtureData = {
    root: await fs.readFile(getPathFixture(urls.root)),
    script: await fs.readFile(getPathFixture(urls.script)),
    link: await fs.readFile(getPathFixture(urls.link)),
    img: await fs.readFile(getPathFixture(urls.img)),
  };

  typesOfResources.forEach((type) => nock(urls.root.toString())
    // .log(console.log)
    .get(urls[type].pathname)
    .reply(200, fixtureData[type])
    .persist());
});

beforeEach(async () => {
  await fs.unlink(pathToTempDir).catch(_.noop);
  const filename = createName(origin, '.html');
  pathToTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathToLoadedHTML = path.join(pathToTempDir, filename);
  pathToTempDirWithFiles = path.join(pathToTempDir, dirNameForFiles);
});

afterEach(async () => {
  await fs.rmdir(pathToTempDir, { recursive: true });
});

test.each(typesOfResources)('%# test %j',
  async (type) => {
    log('page-loader testing started');
    await loadPage(urls.root.toString(), pathToTempDir);
    const isRootURL = type === 'root';
    const pathToLoadedDir = isRootURL ? pathToLoadedHTML : pathToTempDirWithFiles;
    const pathToLoadedFile = path
      .join(pathToLoadedDir, isRootURL ? '' : createName(urls[type].pathname));
    const loadedData = await fs.readFile(pathToLoadedFile, 'utf-8');
    expect(loadedData).toEqual(isRootURL ? changedHTMLData : fixtureData[type].toString());
    log(`"${urls[type].href}" loading tested\ntest completed\n`);
  });
