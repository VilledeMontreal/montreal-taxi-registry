// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from 'class-validator';

/* tslint:disable:max-classes-per-file */
export enum GtfsAssetTypes {
  Standard = 'taxi-registry-standard-route',
  Minivan = 'taxi-registry-minivan-route',
  SpecialNeed = 'taxi-registry-special-need-route'
}

export class GtfsCoordinates {
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lon: number;
}

export class GtfsCoordinatesHolder {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => GtfsCoordinates)
  @ValidateNested()
  coordinates: GtfsCoordinates;
}

export class GtfsInquiryRequestDto {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => GtfsCoordinatesHolder)
  @ValidateNested()
  from: GtfsCoordinatesHolder;

  @IsDefined()
  @IsNotEmpty()
  @Type(() => GtfsCoordinatesHolder)
  @ValidateNested()
  to: GtfsCoordinatesHolder;

  @IsDefined()
  @IsArray()
  @IsEnum(GtfsAssetTypes, { each: true })
  useAssetTypes: GtfsAssetTypes[];

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  operators: number[];
}

export class GtfsInquiryResponseOptionsDto {
  mainAssetType: { id: string };
  departureTime: string;
  arrivalTime: string;
  from: GtfsCoordinatesHolder;
  to: GtfsCoordinatesHolder;
  pricing: {
    estimated: boolean;
    parts: [
      {
        optimisticAmount: number;
        amount: number;
        pessimisticAmount: number;
        currencyCode: string;
      }
    ];
  };
  estimatedWaitTime: number;
  estimatedTravelTime: number;
  booking: {
    agency: {
      id: string;
      name: string;
    };
    mainAssetType: {
      id: string;
    };
    phoneNumber: string;
    androidUri: string;
    iosUri: string;
    webUrl: string;
  };
}

export class GtfsInquiryResponseDto {
  validUntil: string;
  options: GtfsInquiryResponseOptionsDto[];
}
