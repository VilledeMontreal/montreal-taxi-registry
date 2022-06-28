// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateHailRequestDto {
  // tslint:disable: variable-name

  @IsDefined()
  @IsNotEmpty()
  public taxi_id: string;

  public customer_address: string;

  public customer_phone_number: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  public customer_lat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  public customer_lon: number;

  // obsolete: ignored
  public operateur: string;

  // obsolete: always anonynous
  public customer_id: string;
}

// tslint:disable-next-line:max-classes-per-file
export class OperatorUpdateHailRequestDto {
  public status: string;
  public taxi_phone_number: string;
  public incident_taxi_reason: string;
  public reporting_customer: boolean;
  public reporting_customer_reason: string;
}

// tslint:disable-next-line:max-classes-per-file
export class MotorUpdateHailRequestDto {
  public status: string;
  public rating_ride: number;
  public rating_ride_reason: string;
}

// tslint:disable-next-line:max-classes-per-file
export class OperatorHailResponseDto {
  public taxi_phone_number?: string;
}
// tslint:disable-next-line: max-classes-per-file
export class HailResponseDto {
  public creation_datetime: string;
  public customer_address: string;
  public customer_id: string;
  public customer_lat: number;
  public customer_lon: number;
  public customer_phone_number: string;
  public id: string;
  public incident_customer_reason: string;
  public incident_taxi_reason: string;
  public last_status_change: string;
  public operateur: string;
  public rating_ride: number;
  public rating_ride_reason: string;
  public reporting_customer: boolean;
  public reporting_customer_reason: string;
  public status: string;
  public taxi: {
    id: string;
    last_update: number;
    position: {
      lat: number;
      lon: number;
    };
  };
  public taxi_relation: {
    rating: number;
    ban_end: string;
    ban_begin: string;
  };
  public taxi_vignette: string;
  public taxi_phone_number: string;
  public hail: string[];
  public read_only_after?: string;
}

export interface IHistoryItem {
  status: string;
  timestampUTC: string;
}
export interface IDumpData {
  id: string;
  taxi_id: string;
  search_engine_id: number | null;
  rating_ride: number | null;
  rating_ride_reason: string | null;
  incident_taxi_reason: string | null;
  status_history: IHistoryItem[];
}
