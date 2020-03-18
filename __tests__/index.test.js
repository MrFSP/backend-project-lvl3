import { promises as fs } from 'fs';
import nock from 'nock';
import os from 'os';
import path from 'path';
import _ from 'lodash';
import load from '../src';
import { getFileName } from '../src/utils';

nock.disableNetConnect();

const domain = 'https://ru.hexlet.io';
const page = '/courses';
const url = `${domain}${page}`;

const getFixturePath = (name) => path.join(__dirname, '__fixtures__', name);
const pathToFixture = getFixturePath('expected.ru-hexlet-io-courses.html');

let expectedData;
let pathToTempDir;
let dest;

beforeAll(async () => {
  expectedData = await fs.readFile(pathToFixture, 'utf-8').toString();
  nock(domain)
    .log(console.log)
    .get(page)
    .reply(200, expectedData);
});

beforeEach(async () => {
  await fs.unlink(dest).catch(_.noop);
  const filename = getFileName(url, '.html');
  pathToTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  dest = `${pathToTempDir}/${filename}`;
});

test('load', async () => {
  await load(url, pathToTempDir);
  const loadedData = await fs.readFile(dest, 'utf-8');
  await expect(loadedData).toBe(expectedData);
});
