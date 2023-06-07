// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import { ICoordinates } from '../shared/coordinates/coordinates';

export interface IOsrmRoutes {
  legs: IOsrmLegs[];
  distance: number;
  duration: number;
  weight_name: string;
  weight: number;
}

export interface IOsrmLegs {
  steps?: any[];
  distance: number;
  duration: number;
  summary: string;
  weight: number;
}

export interface IRoutePath {
  legTaxiToFrom: IOsrmLegs;
  legFromToDestination: IOsrmLegs;
}

export interface IRoutingTest {
  title: string;
  arrange: {
    closestTaxi: ICoordinates;
    from: ICoordinates;
    to: ICoordinates;
  };
  expectedResponse?: IExpectedResponse;
}

interface IExpectedResponse extends Partial<Response> {
  statusCode: StatusCodes;
  message?: string;
  legTaxiToFrom?: IOsrmLegs;
  legFromToDestination?: IOsrmLegs;
}
