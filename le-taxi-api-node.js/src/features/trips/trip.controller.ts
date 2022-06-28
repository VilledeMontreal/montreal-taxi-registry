// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { constants } from '../../config/constants';
import { UnauthorizedError } from '../errorHandling/errors';
import { tripService } from './trip.service';

class TripController {
  public async extractAndAnonymize(request: Request, response: Response) {
    if (
      configs.environment.type !== constants.Environments.LOCAL &&
      configs.environment.type !== constants.Environments.DEV
    ) {
      throw new UnauthorizedError('Blocked service for this environment - feature will be completed in the future');
    }

    response.sendStatus(StatusCodes.OK);
    await tripService.extractAndAnonymize();
  }
}

export const tripController = new TripController();
