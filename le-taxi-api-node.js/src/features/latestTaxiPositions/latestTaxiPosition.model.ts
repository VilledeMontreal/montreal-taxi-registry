// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InquiryTypes } from '../inquiry/inquiry.dto';
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

export type TaxiSummaryModelExtended = TaxiSummaryModel & { inquiryType: InquiryTypes };
export class LatestTaxiPositionModelExtended extends LatestTaxiPositionModel {
  public taxi?: TaxiSummaryModelExtended;
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
