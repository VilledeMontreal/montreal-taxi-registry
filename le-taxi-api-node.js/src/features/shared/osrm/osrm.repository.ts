// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as superagent from 'superagent';
import { configs } from '../../../config/configs';
import { constants } from '../../../config/constants';
import { BadRequestError } from '../../errorHandling/errors';
import { ICoordinates } from '../coordinates/coordinates';
import { OsrmRoute } from './osrm.model';

class OsrmRepository {
  /**
   * ref: http://project-osrm.org/docs/v5.5.1/api/#general-options
   *
   * duration in (sec)
   * distance in (m)
   */
  public async getRoutes(from: ICoordinates, to: ICoordinates, closestTaxi?: ICoordinates): Promise<OsrmRoute[]> {
    const { base, domainPath, route, version } = configs.taxiRegistryOsrmApi;
    const params = `overview=false&alternatives=false`;

    const closestTaxiPlaceholder = closestTaxi?.lat && closestTaxi?.lon ? `${closestTaxi.lon},${closestTaxi.lat};` : '';
    const cityInternalOsrmUrl = `${base}${domainPath}/${route}/${version}/${constants.osrm.profile.CAR}/${closestTaxiPlaceholder}${from.lon},${from.lat};${to.lon},${to.lat}?${params}`;

    try {
      const response = await superagent.get(cityInternalOsrmUrl);

      if (response.clientError) {
        throw new BadRequestError(`Error calling routing service ${response.error}`);
      }

      if (!response?.body?.routes) {
        throw new BadRequestError(`Error no route found`);
      }

      return response.body.routes;
    } catch (error) {
      if (error.response.body.code === 'NoRoute') {
        return [new OsrmRoute()];
      }

      throw new BadRequestError(`Error calling routing service ${error}`);
    }
  }
}

export const osrmRepository = new OsrmRepository();
