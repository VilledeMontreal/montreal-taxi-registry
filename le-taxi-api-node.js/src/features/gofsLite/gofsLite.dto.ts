// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from "class-validator";
import { FeatureCollection } from "geojson";

/* tslint:enable:allow-snake-case-per-file */
export enum GofsLiteSupportedLangTypes {
  En = "en",
  Fr = "fr",
}

export enum GofsLiteBrandIdTypes {
  Standard = "taxi-registry-standard",
  Minivan = "taxi-registry-minivan",
  SpecialNeed = "taxi-registry-special-need",
}

export class GofsLiteRealtimeBookingRequestDto {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  pickup_lat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  pickup_lon: number;

  @Type(() => String)
  pickup_address: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  drop_off_lat?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  drop_off_lon?: number;

  @Type(() => String)
  drop_off_address: string;

  @IsDefined()
  @IsArray()
  @IsEnum(GofsLiteBrandIdTypes, { each: true })
  brand_id: GofsLiteBrandIdTypes[];
}

export class GofsLiteRealtimeBookingDataResponseDto {
  brand_id: GofsLiteBrandIdTypes;
  wait_time: number;
  travel_time: number;
  travel_cost: number;
  travel_cost_currency: string;
  booking_detail: {
    service_name: string;
    phone_number: string;
    web_uri: string;
    android_uri: string;
    ios_uri: string;
  };
}

export class GofsLiteRealtimeBookingResponseDto {
  realtime_booking: GofsLiteRealtimeBookingDataResponseDto[];
}

export class GofsLiteFeedDetailResponseDto {
  name: string;
  url: string;
}

export class GofsLiteFeedResponseDto {
  en: {
    feeds: GofsLiteFeedDetailResponseDto[];
  };
  fr: {
    feeds: GofsLiteFeedDetailResponseDto[];
  };
}

export class GofsLiteServiceBrandsDetailResponseDto {
  brand_id: string;
  brand_name: string;
}

export class GofsLiteServiceBrandsResponseDto {
  service_brands: GofsLiteServiceBrandsDetailResponseDto[];
}

export class GofsLiteSystemInformationResponseDto {
  language: string;
  timezone: string;
  name: string;
  short_name: string;
}

export class GofsLiteZoneResponseDto {
  zones: FeatureCollection;
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
  data: GofsLiteDataResponseDto;
}

type GofsLiteEmptyDataResponseDto = [];

export type GofsLiteDataResponseDto =
  | GofsLiteRealtimeBookingResponseDto
  | GofsLiteFeedResponseDto
  | GofsLiteServiceBrandsResponseDto
  | GofsLiteSystemInformationResponseDto
  | GofsLiteZoneResponseDto
  | GofsLiteOperatingRulesResponseDto
  | GofsLiteCalendarsResponseDto
  | GofsLiteEmptyDataResponseDto;
