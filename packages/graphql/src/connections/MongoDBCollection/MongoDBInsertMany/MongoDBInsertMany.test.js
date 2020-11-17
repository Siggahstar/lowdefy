/*
  Copyright 2020 Lowdefy, Inc

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import MongoDBInsertMany from './MongoDBInsertMany';
import clearTestMongoDb from '../../../test/clearTestMongoDb';
import { ConfigurationError, RequestError } from '../../../context/errors';
import testSchema from '../../../utils/testSchema';

const { resolver, schema } = MongoDBInsertMany;

const databaseUri = process.env.MONGO_URL;
const databaseName = 'test';
const collection = 'insertMany';

const context = { ConfigurationError, RequestError };

beforeAll(() => {
  return clearTestMongoDb({ collection });
});

test('insertMany', async () => {
  const request = {
    docs: [{ _id: 'insertMany1-1' }, { _id: 'insertMany1-2' }, { _id: 'insertMany1-3' }],
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await resolver({ request, connection, context });
  expect(res).toEqual({
    insertedCount: 3,
    ops: [
      {
        _id: 'insertMany1-1',
      },
      {
        _id: 'insertMany1-2',
      },
      {
        _id: 'insertMany1-3',
      },
    ],
  });
});

test('insertMany options', async () => {
  const request = {
    docs: [{ _id: 'insertMany2-1' }, { _id: 'insertMany2-2' }],
    options: { w: 'majority' },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  const res = await resolver({ request, connection, context });
  expect(res).toEqual({
    insertedCount: 2,
    ops: [
      {
        _id: 'insertMany2-1',
      },
      {
        _id: 'insertMany2-2',
      },
    ],
  });
});

test('insertMany connection error', async () => {
  const request = { docs: [{ _id: 'insertMany8-1' }, { _id: 'insertMany8-2' }] };
  const connection = {
    databaseUri: 'bad_uri',
    databaseName,
    collection,
    write: true,
  };
  await expect(resolver({ request, connection, context })).rejects.toThrow(RequestError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'Invalid connection string'
  );
});

test('insertMany mongodb error', async () => {
  const request = { docs: [{ _id: 'insertMany9-1' }, { _id: 'insertMany9-2' }] };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: true,
  };
  await resolver({ request, connection, context });
  await expect(resolver({ request, connection, context })).rejects.toThrow(RequestError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'BulkWriteError: E11000 duplicate key error dup key: { : "insertMany9-1" }'
  );
});

test('insertMany write false', async () => {
  const request = { docs: [{ _id: 'insertMany10-1' }, { _id: 'insertMany10-2' }] };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    write: false,
  };
  await expect(resolver({ request, connection, context })).rejects.toThrow(ConfigurationError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'MongoDBCollection connection does not allow writes.'
  );
});

test('insertMany write not specified', async () => {
  const request = { docs: [{ _id: 'insertMany11-1' }, { _id: 'insertMany11-2' }] };
  const connection = {
    databaseUri,
    databaseName,
    collection,
  };
  await expect(resolver({ request, connection, context })).rejects.toThrow(ConfigurationError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'MongoDBCollection connection does not allow writes.'
  );
});

test('request not an object', async () => {
  const request = 'request';
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBInsertMany request properties should be an object.'
  );
});

test('request no docs', async () => {
  const request = {};
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBInsertMany request should have required property "docs".'
  );
});

test('request docs not an array', async () => {
  const request = { docs: 'docs' };
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBInsertMany request property "docs" should be an array.'
  );
});

test('request docs not an array of objects', async () => {
  const request = { docs: [1, 2, 3] };
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBInsertMany request property "docs" should be an array of documents to insert.'
  );
});

test('request options not an object', async () => {
  const request = { docs: [], options: 'options' };
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBInsertMany request property "options" should be an object.'
  );
});
