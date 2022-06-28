// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { constants } from '../../config/constants';

export function getAbsoluteUrl(path: string) {
  if (configs.environment.type === constants.Environments.LOCAL) {
    return `${configs.api.scheme}://${configs.api.host}:${configs.api.port}${path}`;
  }

  return `${configs.api.scheme}://${configs.api.host}${path}`;
}
