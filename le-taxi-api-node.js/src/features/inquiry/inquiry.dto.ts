// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { ICoordinates } from "../shared/coordinates/coordinates";
import { UserModel } from "../users/user.model";

/* eslint-disable max-classes-per-file */
export enum InquiryTypes {
  Standard = "standard",
  Minivan = "minivan",
  SpecialNeed = "special-need",
}

interface ICoordinatesWithAddresses extends ICoordinates {
  address?: string;
}

export class InquiryRequest {
  from: ICoordinatesWithAddresses;
  to?: ICoordinatesWithAddresses;
  inquiryTypes: InquiryTypes[];
  operators?: number[];
}

export class InquiryResponse {
  data: InquiryResponseData[];
}

export class InquiryBookingResponseData {
  operator: UserModel;
  phoneNumber: string;
  webUrl: string;
  androidUri: string;
  iosUri: string;
}

export class InquiryResponseData {
  date: string;
  inquiryType: InquiryTypes;
  from: ICoordinatesWithAddresses;
  to?: ICoordinatesWithAddresses;
  estimatedWaitTime: number;
  estimatedTravelTime?: number;
  estimatedPrice?: number;
  booking: InquiryBookingResponseData;
}
