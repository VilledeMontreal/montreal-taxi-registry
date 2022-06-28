// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { validate } from "class-validator";
import { StatusCodes } from 'http-status-codes';
import * as request from 'request';
import { BadRequestError, CustomError } from '../features/errorHandling/errors';
import { postgrePool } from '../features/shared/taxiPostgre/taxiPostgre';
import { ADSModel } from '../models/ads.model';
import { getAbsoluteUrl } from '../utils/configs/system';



export class ADSService {
  constructor() { }

  async upsertADS(data: any, UserModel) {
    let ads = Object.assign(new ADSModel(), data.data[0]);
    try {
      await validate(ads, { skipMissingProperties: true });
    }
    catch (err) {
      throw new BadRequestError(`data validation error: ${err}`)
    }

    const query = `SELECT id FROM public."ADS" WHERE numero = $1::text AND insee = $2::text AND added_by = $3::text`;
    const queryResult = await postgrePool.query(query, [ads.numero, ads.insee, UserModel.id]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0])
      throw new BadRequestError('ADS ID not found');

    ads.id = queryResult.rows[0].id;
    await this.updateADS(ads, UserModel);
  }

  updateADS(ads: ADSModel, UserModel) {
    let sql: string =
      'UPDATE public."ADS" \
        SET numero=$2::text, \
            doublage=$3::bool, \
            last_update_at=now(), \
            insee=$4::text, \
            category=$5::text, \
            owner_name=$6::text, \
            owner_type=$7::owner_type_enum, \
            vdm_vignette=$8::text \
        WHERE id = $1::int';

    return new Promise<void>(function (resolve, reject) {
      postgrePool.query(
        sql,
        [
          ads.id,
          ads.numero,
          ads.doublage,
          ads.insee,
          ads.category,
          ads.owner_name,
          ads.owner_type,
          ads.vdm_vignette
        ],
        function (err, res) {
          if (err) {
            reject(new BadRequestError(err.message));
            return;
          }
          resolve();
        }
      );
    });
  }

  createADS(ads: any, UserModel) {
    const options: any = {
      uri: getAbsoluteUrl('/api/ads/'),
      headers: {
        'content-type': 'application/json',
        'X-VERSION': '2',
        Accept: 'application/json',
        'X-API-KEY': UserModel.apikey
      },
      body: JSON.stringify(ads)
    };

    return new Promise(function (resolve, reject) {
      request.post(options, function (err, response) {
        if (err) {
          reject(err);
        } else {
          if (response.statusCode >= StatusCodes.MULTIPLE_CHOICES) {
            reject(new CustomError(response.statusMessage, response.statusCode));
          } else {
            resolve(response);
          }
        }
      });
    });
  }
}
