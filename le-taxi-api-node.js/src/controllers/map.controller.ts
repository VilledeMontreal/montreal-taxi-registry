// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { constants } from '../config/constants';
import { buildApiEndpoint } from '../features/shared/utils/apiUtils';
import { allow } from '../features/users/securityDecorator';
import { userRepository } from '../features/users/user.repository';
import { UserRole } from '../features/users/userRole';
import { OperatorModel } from '../models/operator.model';
import { TaxiService } from '../services/taxis.service';

const defaultResponseHeaders = constants.defaultResponseHeaders;

export class controller {
  constructor(app) {
    app.get(buildApiEndpoint('/api/legacy-web/taxi-operators'), this.getAllOperators);
    app.get(buildApiEndpoint('/api/legacy-web/taxi-data'), this.taxiData);
    app.get(buildApiEndpoint('/api/legacy-web/taxi-search'), this.taxiSearch);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  getAllOperators(request: Request, response: Response, next: NextFunction) {
    userRepository
      .getUsersByRole(UserRole.Operator)
      .then((users: any[]) => {
        const operators: OperatorModel[] = [];

        users.forEach(({ id, email, commercial_name }) => {
          const operator = new OperatorModel();
          operator.id = id;
          operator.name = email;
          operator.displayName = commercial_name;
          operators.push(operator);
        }, this);

        response.writeHead(StatusCodes.OK, defaultResponseHeaders);
        response.write(JSON.stringify(operators));
        response.end();
      })
      .catch(next);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  taxiData({ query: { idTaxi } }: Request, response: Response, next: NextFunction) {
    const taxiService = new TaxiService();

    taxiService
      .getTaxis(idTaxi as string)
      .then(function(data) {
        response.writeHead(StatusCodes.OK, defaultResponseHeaders);
        response.write(JSON.stringify(data));
        response.end();
      })
      .catch(next);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  taxiSearch({ query: { licencePlate, professionalLicence } }: Request, response: Response, next: NextFunction) {
    const taxiService = new TaxiService();

    taxiService
      .findTaxis(licencePlate as string, professionalLicence as string)
      .then(data => {
        response.writeHead(StatusCodes.OK, defaultResponseHeaders);
        response.write(JSON.stringify(data));
        response.end();
      })
      .catch(next);
  }
}
