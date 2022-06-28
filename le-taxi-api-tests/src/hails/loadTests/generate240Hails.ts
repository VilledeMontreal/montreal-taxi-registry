// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { beforeRequest, initializeMaximumNumberOfTaxis } from './generateHailsCommon';

initializeMaximumNumberOfTaxis(30);

module.exports = {
  beforeRequest
};
