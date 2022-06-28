// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
/* tslint:disable */
import { assert } from 'chai';
import { aFewSeconds, shouldThrow } from '../commonTests/testUtil';
import { ModelMapCache } from './modelMapCache';

const cacheMaximumCapacity = 3;
const cacheExpirationInSeconds = 1;
const delayToWaitForCacheToExpireInSeconds = 3;

describe('ModelMapCache cache', () => {
  it('Should return undefined when querying an empty cache', async () => {
    const mockRepo = {};
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const notInRepo = await mockRepoWithCaching.getByKey('notInRepo');

    assert.strictEqual(notInRepo, undefined);
  });

  it('Should return undefined when querying for null', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const nullValue = await mockRepoWithCaching.getByKey(null);

    assert.strictEqual(nullValue, undefined);
  });

  it('Should return entities from cache when available in cache', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const map = await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
    assert.strictEqual(map['one'], 1);
    assert.strictEqual(map['two'], 2);
    assert.strictEqual(map['three'], 3);

    delete mockRepo['one'];
    delete mockRepo['two'];
    delete mockRepo['three'];

    const mapInCache = await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
    assert.strictEqual(mapInCache['one'], 1);
    assert.strictEqual(mapInCache['two'], 2);
    assert.strictEqual(mapInCache['three'], 3);
  });

  it('Can use getByKey() on cache fed by single accessor', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithSingleCaching(mockRepo);

    const one = await mockRepoWithCaching.getByKey('one');
    assert.strictEqual(one, 1);
  });

  it('Can use getByKey() on cache fed by many accessor', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const one = await mockRepoWithCaching.getByKey('one');
    assert.strictEqual(one, 1);
  });

  it('Can use getByKeys() on cache fed by many accessor', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const map = await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
    assert.strictEqual(map['one'], 1);
    assert.strictEqual(map['two'], 2);
    assert.strictEqual(map['three'], 3);
  });

  it('Can NOT use getByKeys() on cache fed by single accessor', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithSingleCaching(mockRepo);

    await shouldThrow(
      async () => {
        await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
      },
      err => assert.match(err, /fed by a single accessor/)
    );
  });

  it('Should serve getByKey() from getByKeys()', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithErrorCaching(mockRepo);

    try {
      await mockRepoWithCaching.getByKey('one');
    } catch (e) {
      assert.match(e.stack, /ModelMapCache.getByKeys/);
    }
  });

  it('Should support being passed multiple times the same key', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const map = await mockRepoWithCaching.getByKeys(['one', 'one', 'one']);
    assert.strictEqual(Object.values(map).length, 1);
    assert.strictEqual(map['one'], 1);
  });

  it('Should NOT include results for null / undefined keys', async () => {
    const mockRepo = { one: 1, two: 2, three: 3, null: 11, undefined: 12 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const map = await mockRepoWithCaching.getByKeys(['one', null, undefined]);
    assert.strictEqual(Object.values(map).length, 1);
    assert.strictEqual(map['one'], 1);
    assert.strictEqual(map.null, undefined);
    assert.strictEqual(map.undefined, undefined);
  });

  it('Should clear entities after expiration', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    const map = await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
    assert.strictEqual(map['one'], 1);
    assert.strictEqual(map['two'], 2);
    assert.strictEqual(map['three'], 3);

    delete mockRepo['one'];
    delete mockRepo['two'];
    delete mockRepo['three'];
    await aFewSeconds(delayToWaitForCacheToExpireInSeconds);

    const mapExpired = await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);
    assert.strictEqual(mapExpired['one'], undefined);
    assert.strictEqual(mapExpired['two'], undefined);
    assert.strictEqual(mapExpired['three'], undefined);
  });

  it('Should roll out extra entites on max capacity', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithManyCaching(mockRepo);

    await mockRepoWithCaching.getByKeys(['one', 'two', 'three']);

    mockRepo['four'] = 4;
    const fourRolledIntoCache = await mockRepoWithCaching.getByKey('four');
    assert.strictEqual(fourRolledIntoCache, 4);

    delete mockRepo['one'];
    const oneDroppedFromCache = await mockRepoWithCaching.getByKey('one');
    assert.strictEqual(oneDroppedFromCache, undefined);
  });

  it('Can deal with error', async () => {
    const mockRepo = { one: 1, two: 2, three: 3 };
    const mockRepoWithCaching = buildMockRepoWithErrorCaching(mockRepo);

    await shouldThrow(
      async () => {
        await mockRepoWithCaching.getByKey('one');
      },
      err => assert.match(err, /Bang!/)
    );
  });
});

function buildMockRepoWithSingleCaching(mockRepo: { [id: string]: number }) {
  return ModelMapCache.createFromSingle<number>(
    async key => {
      return new Promise(async (resolve, reject) => {
        resolve(mockRepo[key]);
      });
    },

    { maxCapacity: cacheMaximumCapacity, maxAge: cacheExpirationInSeconds * 1000 }
  );
}

function buildMockRepoWithManyCaching(mockRepo: { [id: string]: number }) {
  return ModelMapCache.createFromMany<number>(
    async keys => {
      return new Promise(async (resolve, reject) => {
        const map = {};
        for (const key of keys) map[key] = await mockRepo[key];
        resolve(map);
      });
    },
    { maxCapacity: cacheMaximumCapacity, maxAge: cacheExpirationInSeconds * 1000 }
  );
}

function buildMockRepoWithErrorCaching(mockRepo: { [id: string]: number }) {
  return ModelMapCache.createFromSingle<number>(
    async key => {
      return new Promise((resolve, reject) => {
        reject(new Error('Bang!'));
      });
    },
    { maxCapacity: cacheMaximumCapacity, maxAge: cacheExpirationInSeconds * 1000 }
  );
}
