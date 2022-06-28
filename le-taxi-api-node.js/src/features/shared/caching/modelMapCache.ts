// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as assert from 'assert';
import * as LRUCache from 'lru-cache';
import { ModelMap } from './modelMap';
import { defaultLRUCacheConfig, ICacheConfig } from './taxiCacheConfig';

export class ModelMapCache<TModel> {
  public static createFromSingle<TModel>(
    singleAccessor: (key: string) => Promise<TModel>,
    cacheConfig: ICacheConfig = defaultLRUCacheConfig
  ): ModelMapCache<TModel> {
    const accessor = async (keys: string[]) => {
      assert(keys && keys.length <= 1, 'A ModelMap fed by a single accessor can only be queried by a single key');

      const key = keys[0];
      return {
        [key]: await singleAccessor(key)
      };
    };

    return new ModelMapCache<TModel>(accessor, cacheConfig);
  }

  public static createFromMany<TModel>(
    accessor: (keys: string[]) => Promise<ModelMap<TModel>>,
    cacheConfig: ICacheConfig = defaultLRUCacheConfig
  ): ModelMapCache<TModel> {
    return new ModelMapCache<TModel>(accessor, cacheConfig);
  }

  private accessor: (keys: string[]) => Promise<ModelMap<TModel>>;
  private cache: LRUCache<string, TModel>;
  private constructor(
    accessor: (keys: string[]) => Promise<ModelMap<TModel>>,
    cacheConfig: ICacheConfig = defaultLRUCacheConfig
  ) {
    this.accessor = accessor;
    this.cache = new LRUCache<string, TModel>({
      max: cacheConfig.maxCapacity,
      maxAge: cacheConfig.maxAge
    });
  }

  public async getByKeys(keys: string[]): Promise<ModelMap<TModel>> {
    const [keysInCache, keysNotInCache] = this.lookupAndSanitizeCacheKeys(keys);

    const volatileModels = keysInCache.length && this.getFromCache(keysInCache);
    const persistedModels = keysNotInCache.length && (await this.accessor(keysNotInCache));
    this.setInCache(persistedModels);

    return { ...volatileModels, ...persistedModels };
  }

  public async getByKey(key: string): Promise<TModel> {
    const values = await this.getByKeys([key]);
    return values && values[key];
  }

  private lookupAndSanitizeCacheKeys(keys: string[]): [string[], string[]] {
    const inCache: string[] = [];
    const notInCache: string[] = [];
    const sanitizedKeys = keys.filter((key, index) => key && keys.indexOf(key) === index);
    sanitizedKeys.forEach(key => (this.cache.has(key) ? inCache.push(key) : notInCache.push(key)));
    return [inCache, notInCache];
  }

  private getFromCache(keys: string[]): ModelMap<TModel> {
    return keys.reduce((map, key) => {
      map[key] = this.cache.get(key);
      return map;
    }, {});
  }

  private setInCache(modelMap: ModelMap<TModel>) {
    Object.entries(modelMap).forEach(([key, value]) => this.cache.set(key, value));
  }
}
