// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TaxiSummaryModel } from '../taxiSummaries/taxiSummary.model';

export class LatestTaxiPositionModel {
  public taxiId: string;
  public lat: number;
  public lon: number;
  public location?: ILocation;
  public status: string;
  public timestampUnixTime: number;
  public receivedAt?: Date;
  public taxi?: TaxiSummaryModel;
  public isPromoted: boolean;
}

interface ILocation {
  type: string;
  coordinates: number[];
}

export const latestTaxiPositionNull: LatestTaxiPositionModel = Object.freeze({
  taxiId: null,
  lat: null,
  lon: null,
  status: null,
  timestampUnixTime: null,
  receivedAt: null,
  taxi: null,
  isPromoted: null
});
