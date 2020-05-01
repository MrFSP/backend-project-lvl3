import { promises as fs } from 'fs';
import nock from 'nock';
import debug from 'debug';
import os from 'os';
import path from 'path';
import _ from 'lodash';
import loadPage from '../src';

nock.disableNetConnect();

const log = debug('tests:');

const origin = new URL('https://testpage.ru');
const urls = {
  script: new URL('https://testpage.ru/script?query=value'),
  link: new URL('https://testpage.ru/href/file.css'),
  img: new URL('https://testpage.ru/src!@$%&*()image.jpeg'),
};

const nameOfHTMLFile = 'testpage-ru.html';
const nameOfChangedHTMLFile = 'changed-testpage-ru.html';

const tags = Object.keys(urls);

const namesOfFixtureFiles = {
  script: 'script',
  link: 'href-file.css',
  img: 'src-image.jpeg',
};

const createPathToFixture = (name) => path
  .join(__dirname, '__fixtures__', 'testpage-ru_files', name);

const pathToHTMLFile = path.join(__dirname, '__fixtures__', nameOfHTMLFile);
const pathToChangedHTMLFile = path.join(__dirname, '__fixtures__', nameOfChangedHTMLFile);
const pathsToFixtures = tags
  .reduce((acc, tag) => ({ ...acc, [tag]: createPathToFixture(namesOfFixtureFiles[tag]) }), {});

let pathToTempDir;
let pathToLoadedHTML;
let pathToTempDirWithFiles;
let changedHTMLData;
let fixturesData;

beforeAll(async () => {
  const HTMLData = await fs.readFile(pathToHTMLFile);
  changedHTMLData = await fs.readFile(pathToChangedHTMLFile);
  fixturesData = {
    script: await fs.readFile(pathsToFixtures.script),
    link: await fs.readFile(pathsToFixtures.link),
    img: await fs.readFile(pathsToFixtures.img),
  };
  nock(origin.href)
    // .log(console.log)
    .get('/')
    .reply(200, HTMLData)
    .persist();

  tags.forEach((tag) => nock(origin.href)
    // .log(console.log)
    .get(`${urls[tag].pathname}${urls[tag].search}`)
    .reply(200, fixturesData[tag])
    .persist());
});

beforeEach(async () => {
  await fs.unlink(pathToTempDir).catch(_.noop);
  pathToTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  pathToLoadedHTML = path.join(pathToTempDir, nameOfHTMLFile);
  pathToTempDirWithFiles = path.join(pathToTempDir, 'testpage-ru_files');
});

afterEach(async () => {
  await fs.rmdir(pathToTempDir, { recursive: true });
});

describe('test page-loader', () => {
  test('load origin', async () => {
    log('test page-loader: origin loading: testing started');
    await loadPage(origin.href, pathToTempDir);
    const loadedData = await fs.readFile(pathToLoadedHTML, 'utf-8');
    await expect(loadedData).toEqual(changedHTMLData.toString());
    log('test page-loader: origin loading: testing completed');
  });

  test.each(tags)('%#. load %j',
    async (tag) => {
      log(`test page-loader: "${tag}" loading: testing started`);
      await loadPage(origin.href, pathToTempDir);
      const pathToLoadedFile = path.join(pathToTempDirWithFiles, namesOfFixtureFiles[tag]);
      const loadedData = await fs.readFile(pathToLoadedFile, 'utf-8');
      await expect(loadedData).toEqual(fixturesData[tag].toString());
      log(`test page-loader: "${tag}" loading: testing completed`);
    });

  test('"underfined" output path argument', async () => {
    await expect(loadPage(origin.href, 'underfinedPath')).rejects.toMatchSnapshot();
    log('test page-loader: "underfined" output path argument: testing completed');
  });

  test('reply with status code 404', async () => {
    nock(origin.href)
      .get('/notFound')
      .reply(404);

    await expect(loadPage(`${origin.href}notFound`)).rejects
      .toThrow('Request failed with status code 404');
    log('test page-loader: reply with status code 404: testing completed');
  });
});
