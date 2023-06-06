// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { FeatureCollection } from 'geojson';

/* tslint:disable:max-classes-per-file */
/* tslint:enable:allow-snake-case-per-file */
export enum GofsLiteSupportedLangTypes {
  En = 'en',
  Fr = 'fr',
}

export enum GofsLiteBrandIdTypes {
  Standard = 'taxi-registry-standard-route',
  Minivan = 'taxi-registry-minivan-route',
  SpecialNeed = 'taxi-registry-special-need-route'
}

export class GofsLiteWaitTimeRequestDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  pickup_lat: any;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  pickup_lon: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  drop_off_lat: any;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  drop_off_lon: number;

  @IsDefined()
  @IsArray()
  @IsEnum(GofsLiteBrandIdTypes, { each: true })
  brand_id: GofsLiteBrandIdTypes[];
}

export class GofsLiteWaitTimeDataResponseDto {
  brand_id: GofsLiteBrandIdTypes;
  estimated_wait_time: number;
  estimated_travel_time: number;
  estimated_travel_cost: number;
  estimated_travel_cost_currency: string;
  realtime_booking: {
    booking_detail: {
      service_name: string;
      android_uri: string;
      ios_uri: string;
      web_uri: string;
      phone_number: string;
    }
  }
}

export class GofsLiteWaitTimeResponseDto {
  wait_times: GofsLiteWaitTimeDataResponseDto[];
}

export class GofsLiteFeedDetailResponseDto {
  name: string;
  url: string;
}

export class GofsLiteFeedResponseDto {
  en: {
    feeds: GofsLiteFeedDetailResponseDto[]
  };
  fr: {
    feeds: GofsLiteFeedDetailResponseDto[]
  };
}

export class GofsLiteServiceBrandsDetailResponseDto {
  brand_id: string;
  brand_name: string;
}

export class GofsLiteServiceBrandsResponseDto {
  service_brands: GofsLiteServiceBrandsDetailResponseDto[]
}

export class GofsLiteSystemInformationResponseDto {
  language: string;
  timezone: string;
  name: string;
  short_name: string;
}

export class GofsLiteZoneResponseDto {
  zones: FeatureCollection
}

export class GofsLiteOperatingRulesDetailsDto {
  from_zone_id: string;
  to_zone_id: string;
  calendars: string[];
  vehicle_type_id: string[];
}

export class GofsLiteOperatingRulesResponseDto {
  operating_rules: GofsLiteOperatingRulesDetailsDto[];
}

export class GofsLiteCalendarsDetailsResponseDto {
  calendar_id: string;
  start_date: string;
  end_date: string;
}

export class GofsLiteCalendarsResponseDto {
  calendars: GofsLiteCalendarsDetailsResponseDto[];
}

export class GofsLiteResponseDto {
  last_updated: number;
  ttl: number;
  version: string;
  data: GofsLiteDataResponseDto
}

type GofsLiteEmptyDataResponseDto = [];

export type GofsLiteDataResponseDto =
  GofsLiteWaitTimeResponseDto
  | GofsLiteFeedResponseDto
  | GofsLiteServiceBrandsResponseDto
  | GofsLiteSystemInformationResponseDto
  | GofsLiteZoneResponseDto
  | GofsLiteOperatingRulesResponseDto
  | GofsLiteCalendarsResponseDto
  | GofsLiteEmptyDataResponseDto