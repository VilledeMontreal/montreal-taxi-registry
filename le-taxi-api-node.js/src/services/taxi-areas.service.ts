// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InternalServerError } from '../features/errorHandling/errors';

import { StatusCodes } from 'http-status-codes';

const request = require('request');

class TaxiAreasService {
  getTaxiAreas(openDataUrl: string) {
    return new Promise((resolve, reject) => {
      request.get(openDataUrl, (error, response, body) => {
        if (error || response.statusCode !== StatusCodes.OK) {
          reject(new InternalServerError(error));
        }
        resolve(JSON.parse(body));
      });
    });
  }
}

export const taxiAreasService = new TaxiAreasService();
