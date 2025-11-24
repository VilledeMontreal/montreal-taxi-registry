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
        try {
          const cleanBody = stripBom(body);
          resolve(JSON.parse(cleanBody));
        }
        catch (err) {
          reject(new InternalServerError(err));
        }
      });
    });
  }
}

function stripBom(str) {
  return str.replace(/^\uFEFF/, '');
}

export const taxiAreasService = new TaxiAreasService();
