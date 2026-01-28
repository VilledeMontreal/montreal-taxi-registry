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
export enum GofsSupportedLangTypes {
  En = "en",
  Fr = "fr",
}

export enum GofsBrandIdTypes {
  Standard = "taxi-registry-standard",
  Minivan = "taxi-registry-minivan",
  SpecialNeed = "taxi-registry-special-need",
}

export class GofsRealtimeBookingRequestDto {
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
  @IsEnum(GofsBrandIdTypes, { each: true })
  brand_id: GofsBrandIdTypes[];
}

export class GofsRealtimeBookingDataResponseDto {
  brand_id: GofsBrandIdTypes;
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

export class GofsRealtimeBookingResponseDto {
  realtime_booking: GofsRealtimeBookingDataResponseDto[];
}

export class GofsFeedDetailResponseDto {
  name: string;
  url: string;
}

export class GofsFeedResponseDto {
  en: {
    feeds: GofsFeedDetailResponseDto[];
  };
  fr: {
    feeds: GofsFeedDetailResponseDto[];
  };
}

export class GofsServiceBrandsDetailResponseDto {
  brand_id: string;
  brand_name: string;
}

export class GofsServiceBrandsResponseDto {
  service_brands: GofsServiceBrandsDetailResponseDto[];
}

export class GofsSystemInformationResponseDto {
  language: string;
  timezone: string;
  name: string;
  short_name: string;
}

export class GofsZoneResponseDto {
  zones: FeatureCollection;
}

export class GofsOperatingRulesDetailsDto {
  from_zone_id: string;
  to_zone_id: string;
  calendars: string[];
  vehicle_type_id: string[];
}

export class GofsOperatingRulesResponseDto {
  operating_rules: GofsOperatingRulesDetailsDto[];
}

export class GofsCalendarsDetailsResponseDto {
  calendar_id: string;
  start_date: string;
  end_date: string;
}

export class GofsCalendarsResponseDto {
  calendars: GofsCalendarsDetailsResponseDto[];
}

export class GofsResponseDto {
  last_updated: number;
  ttl: number;
  version: string;
  data: GofsDataResponseDto;
}

type GofsEmptyDataResponseDto = [];

export type GofsDataResponseDto =
  | GofsRealtimeBookingResponseDto
  | GofsFeedResponseDto
  | GofsServiceBrandsResponseDto
  | GofsSystemInformationResponseDto
  | GofsZoneResponseDto
  | GofsOperatingRulesResponseDto
  | GofsCalendarsResponseDto
  | GofsEmptyDataResponseDto;
