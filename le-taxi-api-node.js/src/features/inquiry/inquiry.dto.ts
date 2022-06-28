// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';

/* tslint:disable:max-classes-per-file */
export enum AssetTypes {
  Normal = 'taxi-registry-standard-route',
  Mpv = 'taxi-registry-minivan-route',
  SpecialNeed = 'taxi-registry-special-need-route'
}

export class Coordinates {
  @IsDefined()
  @IsNotEmpty()
  lat: any;
  @IsDefined()
  @IsNotEmpty()
  lon: any;
}

export class CoordinatesHolder {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => Coordinates)
  @ValidateNested()
  coordinates: Coordinates;
}

export class InquiryRequest {
  @IsDefined()
  @IsNotEmpty()
  @Type(() => CoordinatesHolder)
  @ValidateNested()
  from: CoordinatesHolder;

  @IsDefined()
  @IsNotEmpty()
  @Type(() => CoordinatesHolder)
  @ValidateNested()
  to: CoordinatesHolder;

  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(1)
  @IsEnum(AssetTypes, { each: true })
  useAssetTypes: AssetTypes[];

  @IsArray()
  operators: string[];
}

export class InquiryResponseDTO {
  validUntil: string;
  options: [
    {
      mainAssetType: { id: string };
      optimisticDepartureTime: string;
      departureTime: string;
      pessimisticDepartureTime: string;
      optimisticArrivalTime: string;
      arrivalTime: string;
      pessimisticArrivalTime: string;
      from: {
        coordinates: CoordinatesHolder;
      };
      to: {
        coordinates: CoordinatesHolder;
      };
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
    }
  ];
}
