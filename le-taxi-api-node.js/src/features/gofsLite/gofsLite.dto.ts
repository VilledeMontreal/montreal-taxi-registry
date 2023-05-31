// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

/* tslint:disable:max-classes-per-file */
/* tslint:enable:allow-snake-case-per-file */
export enum GofsLiteBrandIdTypes {
  Standard = 'taxi-registry-standard',
  Minivan = 'taxi-registry-minivan',
  SpecialNeed = 'taxi-registry-special-need'
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

export class GofsLiteResponseDto {
  last_updated: number;
  ttl: number;
  version: string;
  data: GofsLiteDataResponseDto
}

export type GofsLiteDataResponseDto = GofsLiteWaitTimeResponseDto | GofsLiteFeedResponseDto;
