// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import * as GeoJSON from 'geojson';
import { StatusCodes } from 'http-status-codes';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';

class MapController {
  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getLatestTaxiPositions(request: Request, response: Response) {
    const latestTaxiPositions = await latestTaxiPositionRepository.getLatestTaxiPositions();

    response.status(StatusCodes.OK);
    response.json(GeoJSON.parse(latestTaxiPositions, { Point: ['lat', 'lon'] }));
  }
}
export const mapController = new MapController();
