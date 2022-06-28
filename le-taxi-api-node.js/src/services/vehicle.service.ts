// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import * as request from 'request';
import { CustomError } from '../features/errorHandling/errors';
import { getAbsoluteUrl } from '../utils/configs/system';

export class VehicleService {
  createVehicle(vehicle: any, UserModel) {
    const options: any = {
      uri: getAbsoluteUrl('/api/vehicles/'),
      headers: {
        'content-type': 'application/json',
        'X-VERSION': '2',
        Accept: 'application/json',
        'X-API-KEY': UserModel.apikey
      },
      body: JSON.stringify(vehicle).replace('Xconstructor', 'constructor')
    };

    return new Promise(function (resolve, reject) {
      request.post(options, function (err, response) {
        if (err) {
          reject(err);
        } else {
          if (response.statusCode >= StatusCodes.MULTIPLE_CHOICES) {
            reject(new CustomError(response.statusMessage, response.statusCode));
          } else {
            let resp: any = {};
            resp.body = response.body;
            resp.statusCode = StatusCodes.CREATED;
            resolve(resp);
          }
        }
      });
    });
  }
}
