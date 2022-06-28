// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import * as request from 'request';
import { CustomError } from '../features/errorHandling/errors';
import { integrationTool } from '../features/integrationTools/integrationToolDecorator';
import { buildApiEndpoint } from '../features/shared/utils/apiUtils';
import { allow } from '../features/users/securityDecorator';
import { userRepository } from '../features/users/user.repository';
import { ResponseCloner } from '../libs/ResponseCloner';
import { security } from '../libs/security';
import { HailValidator } from '../services/hail-validator.service';
import { getAbsoluteUrl } from '../utils/configs/system';

export class controller {
  constructor(app) {
    app.post(buildApiEndpoint('/api/operator-integration-tools/hails-as-motor'), this.createHail);
    app.put(buildApiEndpoint('/api/operator-integration-tools/hails-as-motor/:id'), this.updateHail);

    app.get(buildApiEndpoint('/api/hailTestingDone'), this.hailTestingDone);
    app.get(buildApiEndpoint('/api/hailTestingData'), this.hailTestingData);

    app.get(buildApiEndpoint('/api/hailTestingData/:idOperateur'), this.hailTestingDataById);
  }

  @integrationTool()
  @allow(['admin', 'gestion'])
  hailTestingDataById(req, res, next) {
    const hailValidator: HailValidator = new HailValidator();
    hailValidator.getCountStatusUsed(req.params.idOperateur)
      .then(function (data) {
        res.status(StatusCodes.OK).send(data);
      })
      .catch(next);
  }

  @integrationTool()
  @allow(['operateur'])
  hailTestingDone(req, res, next) {
    const hailValidator: HailValidator = new HailValidator();
    hailValidator.getFinalStatus(req.userModel.id)
      .then(function (data) {
        res.status(StatusCodes.OK).send(data);
      })
      .catch(next);
  }

  @integrationTool()
  @allow(['operateur'])
  hailTestingData(req: any, res: any, next: any) {
    const hailValidator: HailValidator = new HailValidator();
    hailValidator
      .getCountStatusUsed(req.userModel.id)
      .then(data => {
        res.status(StatusCodes.OK).send(data);
      })
      .catch(next);
  }

  @integrationTool()
  @allow(['admin', 'operateur'])
  async createHail(req, res, next) {
    const user = await userRepository.getUserForAuthentication('motor_tester');
    const apikey = security.decrypt(user.apikey);
    const options: any = {
      uri: getAbsoluteUrl('/api/hails/'),
      headers: {
        'content-type': 'application/json',
        'X-VERSION': '2',
        Accept: 'application/json',
        'X-API-KEY': apikey
      },
      body: JSON.stringify(req.body)
    };
    request.post(options, function (err, response) {
      if (err) {
        next(err);
      } else {
        res = new ResponseCloner(response, res);

        if (![StatusCodes.OK, StatusCodes.CREATED].includes(res.statusCode)) {
          next(new CustomError(getErrorMessage(res), res.statusCode));
        }
        else {
          res.writeHeader(StatusCodes.CREATED, { "Content-Type": "application/json" });
          res.write(response.body);
        }
        res.end();
      }
    });
  }

  @integrationTool()
  @allow(['admin', 'operateur'])
  async updateHail(req, res, next) {
    const user = await userRepository.getUserForAuthentication('motor_tester');
    const apikey = security.decrypt(user.apikey);
    const options: any = {
      uri: getAbsoluteUrl('/api/hails/' + req.params.id + '/'),
      headers: {
        'content-type': 'application/json',
        'X-VERSION': '2',
        Accept: 'application/json',
        'X-API-KEY': apikey
      },
      body: JSON.stringify(req.body)
    };

    request.put(options, function (err, response) {
      if (err) {
        next(err);
      } else {
        res = new ResponseCloner(response, res);
        if (![StatusCodes.OK, StatusCodes.CREATED].includes(res.statusCode)) {
          next(new CustomError(getErrorMessage(res), res.statusCode));
        }
        else {
          res.writeHeader(StatusCodes.OK, { "Content-Type": "application/json" });
          res.write(response.body);
        }
        res.end();
      }
    });
  }
}

function getErrorMessage(response: any) {
  try {
    var json = JSON.parse(response.body);
    return json?.error?.message || response.body;
  }
  catch(e) { }

  return response.body;
}