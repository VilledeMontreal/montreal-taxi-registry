// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import superagent from "superagent";
import { configs } from "../../../config/configs";
import { constants } from "../../../config/constants";
import { BadRequestError } from "../../errorHandling/errors";
import { ICoordinates } from "../coordinates/coordinates";
import { OsrmRoute } from "./osrm.model";

class OsrmRepository {
  /**
   * ref: http://project-osrm.org/docs/v5.5.1/api/#general-options
   *
   * duration in (sec)
   * distance in (m)
   */
  public async getRoutes(
    from: ICoordinates,
    to: ICoordinates,
  ): Promise<OsrmRoute[]> {
    const { base, domainPath } = configs.taxiRegistryOsrmApi;
    const params = `overview=false&alternatives=false`;
    const url = `${base}${domainPath}/${constants.osrm.profile.ROUTE}/${from.lon},${from.lat};${to.lon},${to.lat}?${params}`;

    try {
      const response = await superagent.get(url);
      if (response.clientError)
        throw new BadRequestError(
          `Error calling routing service ${JSON.stringify(response.error)}`,
        );
      if (!response?.body?.routes)
        throw new BadRequestError(`Error no route found`);
      return response.body.routes;
    } catch (error) {
      if (error.response.body.code === "NoRoute") return [new OsrmRoute()];
      throw new BadRequestError(`Error calling routing service ${error}`);
    }
  }

  public async getTable(
    origin: ICoordinates,
    destinations: ICoordinates[],
  ): Promise<number[][]> {
    const { base, domainPath } = configs.taxiRegistryOsrmApi;
    const params = `sources=0&destinations=`;

    const destinationsPlaceholder = destinations.reduce((acc, closestTaxi) => {
      acc += `;${closestTaxi.lon},${closestTaxi.lat}`;
      return acc;
    }, "");

    const destinationsNumber = Array.from(destinations, (_, i) => i + 1).join(
      ";",
    );
    const url = `${base}${domainPath}/${constants.osrm.profile.TABLE}/${origin.lon},${origin.lat}${destinationsPlaceholder}?${params}${destinationsNumber}`;

    try {
      const response = await superagent.get(url);
      if (response.clientError)
        throw new BadRequestError(
          `Error calling table service ${JSON.stringify(response.error)}`,
        );
      if (response.body.code !== "Ok" || !response?.body?.durations) {
        throw new BadRequestError(`Error unable to get routing tables`);
      }
      return response.body.durations;
    } catch (error) {
      if (error.response.body.code === "NoTable") return [];
      throw new BadRequestError(`Error calling routing service ${error}`);
    }
  }
}

export const osrmRepository = new OsrmRepository();
