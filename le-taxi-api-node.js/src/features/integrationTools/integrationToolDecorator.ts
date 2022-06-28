// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as assert from 'assert';
import { configs } from '../../config/configs';
import { constants } from '../../config/constants';
import { UnauthorizedError } from '../errorHandling/errors';

export function integrationTool() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    assert.ok(typeof originalMethod === 'function', 'The IntegrationTool annotation can only be used on functions.');

    descriptor.value = function() {
      switch (configs.environment.type) {
        case constants.Environments.LOCAL:
        case constants.Environments.DEV:
        case constants.Environments.ACC: {
          return originalMethod.apply(this, arguments);
        }
        default:
        case constants.Environments.PROD: {
          throw new UnauthorizedError('Blocked service for this environment');
        }
      }
    };
  };
}
