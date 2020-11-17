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

import MongoDBFind from './MongoDBFind';
import populateTestMongoDb from '../../../test/populateTestMongoDb';
import { ConfigurationError, RequestError } from '../../../context/errors';
import testSchema from '../../../utils/testSchema';

const { resolver, schema } = MongoDBFind;

const query = { _id: 1 };

const databaseUri = process.env.MONGO_URL;
const databaseName = 'test';
const collection = 'find';
const documents = [{ _id: 1 }, { _id: 2 }, { _id: 3 }];

const context = { ConfigurationError, RequestError };

beforeAll(() => {
  return populateTestMongoDb({ collection, documents });
});

test('find', async () => {
  const request = { query };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    read: true,
  };
  const res = await resolver({ request, connection, context });
  expect(res).toEqual([
    {
      _id: 1,
    },
  ]);
});

test('find options', async () => {
  const request = {
    query: { _id: { $gt: 1 } },
    options: { limit: 1, sort: [['id', 1]] },
  };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    read: true,
  };
  const res = await resolver({ request, connection, context });
  expect(res).toEqual([
    {
      _id: 2,
    },
  ]);
});

test('find mongodb error', async () => {
  const request = { query: { x: { $badOp: 1 } } };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    read: true,
  };
  await expect(resolver({ request, connection, context })).rejects.toThrow(RequestError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'MongoError: unknown operator: $badOp'
  );
});

test('find read false', async () => {
  const request = { query };
  const connection = {
    databaseUri,
    databaseName,
    collection,
    read: false,
  };
  await expect(resolver({ request, connection, context })).rejects.toThrow(ConfigurationError);
  await expect(resolver({ request, connection, context })).rejects.toThrow(
    'MongoDBCollection connection does not allow reads.'
  );
});

test('find read not specified', async () => {
  const request = { query };
  const connection = {
    databaseUri,
    databaseName,
    collection,
  };
  const res = await resolver({ request, connection, context });
  expect(res).toEqual([
    {
      _id: 1,
    },
  ]);
});

test('request not an object', async () => {
  const request = 'request';
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBFind request properties should be an object.'
  );
});

test('request no query', async () => {
  const request = {};
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBFind request should have required property "query".'
  );
});

test('request query not an object', async () => {
  const request = { query: 'query' };
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBFind request property "query" should be an object.'
  );
});

test('request options not an object', async () => {
  const request = { query: { _id: 'test' }, options: 'options' };
  await expect(() => testSchema({ schema, object: request })).toThrow(ConfigurationError);
  await expect(() => testSchema({ schema, object: request })).toThrow(
    'MongoDBFind request property "options" should be an object.'
  );
});
