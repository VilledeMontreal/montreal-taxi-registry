// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../../config/configs';

export const expectedActiveTaxisAtATime4Mtl = 5000;
export const taxisMaxAgeInSec: number = configs.caching.taxisMaxAgeInSec;

export interface ICacheConfig {
  maxCapacity: number;
  maxAge: number;
}

export const defaultLRUCacheConfig = {
  maxCapacity: expectedActiveTaxisAtATime4Mtl * 4, // We put a generous (x4) value here since memory is no stake now.
  maxAge: taxisMaxAgeInSec * 1000
};
