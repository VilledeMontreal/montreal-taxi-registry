// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from 'class-transformer';
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from 'class-validator';

/* tslint:disable:max-classes-per-file */
export enum GtfsAssetTypes {
  Standard = 'taxi-registry-standard',
  Minivan = 'taxi-registry-minivan',
  SpecialNeed = 'taxi-registry-special-need'
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

export class GtfsCoordinatesNullable {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat?: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lon?: number;
}

export class GtfsAddress {
  @IsDefined()
  @Type(() => String)
  streetAddress: string;
}

export class GtfsAddressHolder {
  @Type(() => GtfsAddress)
  @ValidateNested()
  physicalAddress?: GtfsAddress;
}

export class GtfsCoordinatesHolder extends GtfsAddressHolder {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => GtfsCoordinates)
  @ValidateNested()
  coordinates: GtfsCoordinates;
}

export class GtfsCoordinatesHolderNullable extends GtfsAddressHolder {
  @Type(() => GtfsCoordinatesNullable)
  @ValidateNested()
  coordinates?: GtfsCoordinatesNullable;
}

export class GtfsInquiryRequestDto {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => GtfsCoordinatesHolder)
  @ValidateNested()
  from: GtfsCoordinatesHolder;

  @Type(() => GtfsCoordinatesHolderNullable)
  @ValidateNested()
  to?: GtfsCoordinatesHolderNullable;

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
    parts: {
      amount: number;
      currencyCode: string;
    }[];
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
    webUrl: string;
    androidUri: string;
    iosUri: string;
  };
}

export class GtfsInquiryResponseDto {
  validUntil: string;
  options: GtfsInquiryResponseOptionsDto[];
}
