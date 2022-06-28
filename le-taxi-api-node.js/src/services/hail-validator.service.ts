// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError, InternalServerError } from '../features/errorHandling/errors';
import { postgrePool } from '../features/shared/taxiPostgre/taxiPostgre'

export class HailValidator {
  constructor() { }
  getFinalStatus(idOperateur: any) {
    return new Promise(function (resolve, reject) {
      let objResponseDetail: any = {};
      objResponseDetail.isDone = false;

      const validateHail: HailValidator = new HailValidator();
      validateHail
        .getCountStatusUsed(idOperateur)
        .then((data: any) => {
          let isAllDone = true;

          let lstStatut = [
            'finished',
            'declined_by_taxi',
            'timeout_taxi',
            'incident_taxi',
            'incident_customer',
            'declined_by_customer',
            'timeout_customer'
          ];

          lstStatut.forEach(function (val) {
            try {
              if (data.lstStatus.find(x => x.status === val).count > 0) {
                objResponseDetail['has_' + val] = true;
              } else {
                objResponseDetail['has_' + val] = false;
                isAllDone = false;
              }
            } catch (e) {
              objResponseDetail['has_' + val] = false;
              isAllDone = false;
            }
          });

          objResponseDetail.isDone = isAllDone;
          resolve(objResponseDetail);
        })
        .catch(reject);
    });
  }

  getCountStatusUsed(idOperateur) {
    return new Promise(function (resolve, reject) {
      const sqlCountStatusUsed = `SELECT count(status) as count,
      status FROM public.hail where operateur_id = $1::int group by status`;

      let objData: any = {};
      objData.totalHailCount = 0;
      objData.lstStatus = new Array();

      postgrePool.query(sqlCountStatusUsed, [idOperateur], (err: any, result: any) => {
        if (err) {
          reject(new InternalServerError('Unknown error'));
          return;
        }

        if (result.rows.length > 0) {
          result.rows.forEach(element => {
            objData.totalHailCount += parseInt(element.count);
            objData.lstStatus.push(element);
          });
          resolve(objData);
        } else {
          reject(new BadRequestError('No Hail found')); // Source error
          return;
        }
      });
    });
  }
}