// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { ModelMapCache } from '../shared/caching/modelMapCache';
import { UserModel } from './user.model';
import { userRepository } from './user.repository';

export const userRepositoryWithCaching = ModelMapCache.createFromSingle<UserModel>(
  async key => await userRepository.getUserByApiKey(key),
  { maxCapacity: 50, maxAge: configs.caching.usersMaxAgeInSec * 1000 }
);

export const userRepositoryByIdWithCaching = ModelMapCache.createFromSingle<UserModel>(
  async key => await userRepository.getUserById(key),
  { maxCapacity: 50, maxAge: configs.caching.usersMaxAgeInSec * 1000 }
);
