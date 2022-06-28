// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as moment from 'moment';
import { constants } from '../../config/constants';
import { BadRequestError } from '../errorHandling/errors';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { TaxiPathRepository } from './taxiPath.repo';
import { TaxiPathService } from './taxiPath.service';

export class TaxiPathController {
  public static validateDateQuery(fromDateQuery: string, toDateQuery: string): { minDate: Date; maxDate: Date } {
    if (!fromDateQuery) {
      throw new BadRequestError('Missing parameters. Required parameter missing: fromDate');
    }

    if (!toDateQuery) {
      throw new BadRequestError('Missing parameters. Required parameter missing: toDate');
    }

    const minDate = new Date(fromDateQuery);
    const maxDate = new Date(toDateQuery);

    if (!moment(minDate).isValid() || !moment(maxDate).isValid()) {
      throw new BadRequestError('Invalid date value. Ex:YYYY-MM-DDThh:mm:ss.nnnZ');
    }

    if (minDate.toISOString() !== fromDateQuery || maxDate.toISOString() !== toDateQuery) {
      throw new BadRequestError('Invalid date format. Ex:YYYY-MM-DDThh:mm:ss.nnnZ');
    }

    if (minDate > maxDate) {
      throw new BadRequestError('Invalid dates. fromDate has to be before toDate');
    }

    if ((maxDate.getTime() - minDate.getTime()) / 36e5 > 8) {
      throw new BadRequestError('Invalid dates. Difference between dates must be smaller than 8 hours');
    }

    return { minDate, maxDate };
  }

  @allow([UserRole.Admin, UserRole.Inspector])
  public async exportTaxiPath(
    { params: { id }, query: { fromDate, toDate } }: Request,
    res: Response,
    next: NextFunction
  ) {
    const validatedDates = TaxiPathController.validateDateQuery(fromDate as string, toDate as string);

    const taxiPathRepository = new TaxiPathRepository();

    const taxiInformation = await taxiPathRepository.getTaxiInfo(id);

    if (!taxiInformation) {
      res.status(StatusCodes.NOT_FOUND).send(`Taxi with ID of ${id} was not found.`);
    }

    const taxiSnapshots = await taxiPathRepository.getTaxiPositionSnapshots(
      id,
      validatedDates.minDate,
      validatedDates.maxDate
    );

    const taxiPathService = new TaxiPathService();

    const geoLineString = Object.assign(
      { line: taxiPathService.getPositionsFromSnapshots(taxiSnapshots) },
      taxiInformation
    );

    const geoJson = taxiPathService.generateGeoJson(geoLineString, taxiSnapshots);

    res.set(constants.defaultResponseHeaders);
    res.status(StatusCodes.OK).send(geoJson);
  }
}

export const taxiPathController = new TaxiPathController();
