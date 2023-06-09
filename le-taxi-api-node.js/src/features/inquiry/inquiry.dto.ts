// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { ICoordinates } from '../shared/coordinates/coordinates';
import { UserModel } from '../users/user.model';

/* tslint:disable:max-classes-per-file */
export enum InquiryTypes {
  Standard = 'standard',
  Minivan = 'minivan',
  SpecialNeed = 'special-need'
}

export class InquiryRequest {
  from: ICoordinates;
  to: ICoordinates;
  inquiryTypes: InquiryTypes[];
  operators?: number[];
}

export class InquiryResponse {
  data: InquiryResponseData[];
}

export class InquiryResponseData {
  date: string;
  inquiryType: InquiryTypes;
  operator: UserModel;
  from: ICoordinates;
  to: ICoordinates;
  estimatedWaitTime: number;
  estimatedTravelTime: number;
  estimatedPrice: number;
}
