// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

// eslint-disable variable-name
class Vehicle {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public licence_plate: string;
}

// eslint-disable-next-line max-classes-per-file
class Driver {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public departement: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public professional_licence: string;
}

// eslint-disable-next-line max-classes-per-file
class Ads {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public insee: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public numero: string;
}

// eslint-disable-next-line max-classes-per-file
export class TaxiRequestDto {
  @IsDefined()
  @IsNotEmpty()
  public ads: Ads;

  @IsDefined()
  @IsNotEmpty()
  public driver: Driver;

  @IsDefined()
  @IsNotEmpty()
  public vehicle: Vehicle;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public status: string;

  @IsOptional()
  @IsBoolean()
  public private: boolean;

  constructor() {
    this.private = false;
  }
}

// eslint-disable-next-line max-classes-per-file
export class TaxiResponseDto {
  public ads: {
    insee: string;
    numero: string;
  };

  public driver: {
    departement: string;
    professional_licence: string;
  };

  public position: {
    lat: number;
    lon: number;
  };

  public vehicle: {
    characteristics: string[];
    color: string;
    constructor: string;
    licence_plate: string;
    model: string;
    nb_seats: number;
    type_: string;
  };

  public crowfly_distance: number;
  public id: string;
  public last_update: string | number;
  public operator: string;
  public private: boolean;
  public rating: number;
  public status: string;
}

// eslint-disable-next-line max-classes-per-file
export class DeprecatedUpdateTaxiRequestDto {
  public status?: string;
  public private: string | boolean;
}
