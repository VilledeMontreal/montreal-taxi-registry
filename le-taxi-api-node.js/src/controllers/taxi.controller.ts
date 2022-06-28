// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { constants } from '../config/constants';
import { integrationTool } from '../features/integrationTools/integrationToolDecorator';
import { buildApiEndpoint } from '../features/shared/utils/apiUtils';
import { allow } from '../features/users/securityDecorator';
import { UserRole } from '../features/users/userRole';
import { ADSModel } from '../models/ads.model';
import { DriverModel } from '../models/driver.response.model';
import { VehicleModel } from '../models/vehicle.model';
import { MoteurValidatorService } from '../services/moteurValidator.service';
import { taxiMapper } from './../features/taxis/taxi.mapper';

const defaultResponseHeaders = constants.defaultResponseHeaders;

export class controller {
  constructor(app) {
    app.get(buildApiEndpoint('/api/motor-integration-tools/taxis'), this.getTaxisForMotorIntegrationTool);
  }

  @integrationTool()
  @allow([UserRole.Motor])
  public async getTaxisForMotorIntegrationTool(request: Request, res: Response, next: NextFunction) {
    let motorValidatorService = new MoteurValidatorService();
    const [firstOperator, secondOperator] = await motorValidatorService.createOperator(request.userModel);

    const NBR_FAKE_TAXIS = 10;

    const lstDrivers = (await motorValidatorService.createDriver(NBR_FAKE_TAXIS, firstOperator)) as DriverModel[];
    const lstVehicules = (await motorValidatorService.createVehicule(NBR_FAKE_TAXIS, firstOperator)) as VehicleModel[];
    const lstAds = (await motorValidatorService.createADS(
      NBR_FAKE_TAXIS,
      firstOperator,
      request.query.lat as string,
      request.query.lon as string
    )) as ADSModel[];

    const lstTaxis = (await motorValidatorService.createTaxis(
      lstAds,
      lstDrivers,
      lstVehicules,
      firstOperator
    )) as any[];

    await motorValidatorService.callGeoserveur(lstTaxis, request.query.lat, request.query.lon, firstOperator);

    let result: any = {};
    result.data = [];

    for (var _i = 0; _i < lstTaxis.length; _i++) {
      result.data[_i] = lstTaxis[_i];
    }
    const response: any = await motorValidatorService.CreateTaxiDoublon(
      lstTaxis[0],
      lstTaxis[0].position.lat,
      lstTaxis[0].position.lon,
      secondOperator
    );

    let lstTaxisDoublon: Array<any> = new Array();
    lstTaxisDoublon.push(response.data[0]);
    lstTaxisDoublon[0].crowfly_distance = lstTaxis[0].crowfly_distance;

    await motorValidatorService.callGeoserveur(
      lstTaxisDoublon,
      lstTaxis[0].position.lat,
      lstTaxis[0].position.lon,
      secondOperator,
      true
    );

    let resultAnonymizedTaxis: any = {}
    resultAnonymizedTaxis.data = result.data.map(taxi => taxiMapper.anonymizeTaxi(taxi));
    resultAnonymizedTaxis.data.push(taxiMapper.anonymizeTaxi(lstTaxisDoublon[0]));
    res.writeHead(StatusCodes.OK, defaultResponseHeaders);
    res.write(JSON.stringify(resultAnonymizedTaxis));
    res.end();
  }
}