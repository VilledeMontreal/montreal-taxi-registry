// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as core from 'express-serve-static-core';
import { configs } from '../../config/configs';
import { constants } from '../../config/constants';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
const mockit = require('mockit-express');
const router = mockit('src/features/fakeApi/fakeRoutes.yml');

export function initializeFakeApi(app: core.Express) {
  if (configs.environment.type !== constants.Environments.PROD) {
    app.use(buildApiEndpoint('/api/fakes'), router);
  }
}
