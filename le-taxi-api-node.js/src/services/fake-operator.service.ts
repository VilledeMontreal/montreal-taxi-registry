// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import * as request from 'request';
import { BadRequestError } from '../features/errorHandling/errors';
import { userRepository } from '../features/users/user.repository';
import { cases, HailCases } from '../models/hailcases.model';
import { TaxiService } from '../services/taxis.service';
import { getAbsoluteUrl } from '../utils/configs/system';

export class FakeOperatorService {
  public hail_id = '';
  public hailCase: HailCases;
  public currentAction = 0;
  public mytaxi: any;

  constructor() { }

  doAction(taxiId, hailId) {
    var parent = this;
    return new Promise<void>(function (resolve, reject) {
      if (taxiId) {
        parent.hail_id = hailId;

        let taxiService = new TaxiService();
        taxiService
          .getTaxis(taxiId)
          .then(function (vals) {
            parent.mytaxi = vals[0];
            let m: string = parent.mytaxi.model_name;
            let c: cases = cases[m];
            parent.hailCase = new HailCases(c);
            parent.executeAction();
            resolve();
          })
          .catch(function () {
            reject(new BadRequestError('No taxi found.'));
          });
      } else {
        reject(new BadRequestError('No taxi id found.'));
        return;
      }
    });
  }

  executeAction() {
    var parent = this;
    if (this.currentAction < this.hailCase.actions.length) {
      if (this.hailCase.actions[this.currentAction].statut != 'failure') {
        setTimeout(function () {
          let obj: any = {};
          obj.data = [];
          obj.data[0] = {};
          obj.data[0].status = parent.hailCase.actions[parent.currentAction].statut;

          userRepository
            .getUserForIntegrationTools(parent.mytaxi.id)
            .then(function (result: any) {
              if (result) {
                var apikey = result.operator_api_key;
                const options: any = {
                  uri: getAbsoluteUrl('/api/hails/' + parent.hail_id + '/'),
                  headers: {
                    'content-type': 'application/json',
                    'X-VERSION': '2',
                    Accept: 'application/json',
                    'X-API-KEY': apikey
                  },
                  body: JSON.stringify(obj)
                };

                request.put(options, function (err, response) {
                  if (err) {
                    console.log(err);
                  } else {
                    if (response.statusCode == StatusCodes.OK || response.statusCode == StatusCodes.CREATED) {
                      if ((
                          parent.hailCase.case === cases.happy_path &&
                          parent.hailCase.actions[parent.currentAction].statut == 'accepted_by_taxi'
                        ) || (
                          parent.hailCase.case === cases.canceled_by_taxi_after_accepted_by_customer &&
                          parent.hailCase.actions[parent.currentAction].statut == 'accepted_by_taxi'
                        )
                      ) {
                        parent.checkStatus(parent.hail_id, apikey);
                      } else {
                        parent.currentAction++;
                        parent.executeAction();
                      }
                    } else {
                      console.log(response.body);
                    }
                  }
                });
              }
            })
            .catch(function () { });
        }, parent.hailCase.actions[parent.currentAction].timeout);
      }
    }
  }

  checkStatus(haild_id, apikey) {
    var parent = this;
    setTimeout(function () {
      const options: any = {
        uri: getAbsoluteUrl('/api/hails/' + parent.hail_id + '/'),
        headers: {
          'content-type': 'application/json',
          'X-VERSION': '2',
          Accept: 'application/json',
          'X-API-KEY': apikey
        }
      };

      request.get(options, function (err, response) {
        if (err) {
          console.log(err);
        } else {
          if (response.statusCode == StatusCodes.OK || response.statusCode ==  StatusCodes.CREATED) {
            if (response.body.length > 0) {
              let obj = JSON.parse(response.body);
              if (
                obj.data[0].status == 'accepted_by_customer' ||
                obj.data[0].status == 'timeout_customer' ||
                obj.data[0].status == 'failure'
              ) {
                //finir la boucle
                parent.currentAction++;
                parent.executeAction();
              } else {
                //continuer la boucle
                parent.checkStatus(haild_id, apikey);
              }
            } else {
              //continuer la boucle
              parent.checkStatus(haild_id, apikey);
            }
          }
        }
      });
    }, 5000);
  }
}
