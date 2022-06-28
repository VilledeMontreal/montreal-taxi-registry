// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as config from 'config';

export class ConfigCache {
  private cache: Map<string, any> = new Map<string, any>();

  /**
   * get
   *
   * Retrieves and optionally transforms a configuration element.
   *
   * @param key Key associated with the configuration element to retrieve
   * @param transformer Optional function to transform retrieved configuration element
   */
  public get<T>(key: string, transformer?: (rawVal: T) => T): T {
    return this.getOrDynamic(key, false, transformer);
  }

  /**
   * Allows the creation of a configuration that doesn't have an
   * associated entry in the configuration files (it is dynamically
   * generated).
   *
   * @param key Key associated with the configuration element to retrieve
   * @param creator function to create the dynamic element
   */
  public dynamic<T>(key: string, creator: () => T): T {
    return this.getOrDynamic(key, true, creator);
  }

  /**
   * set
   *
   * Set new value to a configuration element in the cache. If
   * undefined is used as the new value, the element is deleted
   * from the cache.
   *
   * @param key The key associated with the value to be replaced
   * @param value New value by which current value will be replaced
   * @returns original value as we do not save it and the caller is aware of the new value
   *
   * @throws Error [ undefined configuration property ]
   */
  public set<T>(key: string, value: T): T {
    // retrieve old value
    const oldValue = this.cache.get(key);

    if (value === undefined) {
      this.cache.delete(key);
    } else {
      this.cache.set(key, value);
    }

    return oldValue;
  }

  protected getOrDynamic<T>(key: string, isDynamic: boolean, transformer?: (rawVal?: T) => T): T {
    let configElement: T;

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    configElement = isDynamic ? undefined : (config.get(key) as T);
    configElement = transformer ? transformer(configElement) : configElement;
    this.cache.set(key, configElement);

    return this.cache.get(key);
  }
}
