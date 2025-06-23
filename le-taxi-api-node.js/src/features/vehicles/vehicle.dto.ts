// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  NotContains,
} from "class-validator";
import { VehicleTypes } from "./vehicle-types.enum";

export class VehicleRequestDto {
  // eslint-disable variable-name
  @IsOptional()
  @IsBoolean()
  public air_con: boolean;

  @IsOptional()
  @IsBoolean()
  public amex_accepted: boolean;

  @IsOptional()
  @IsBoolean()
  public baby_seat: boolean;

  @IsOptional()
  @IsBoolean()
  public bank_check_accepted: boolean;

  @IsOptional()
  @IsBoolean()
  public bike_accepted: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public color: string;

  @IsOptional()
  @IsBoolean()
  public cpam_conventionne: boolean;

  @IsOptional()
  @IsBoolean()
  public credit_card_accepted: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^\d{4}[- ;,/.]\d{2}[- ;,/.]\d{2}$/)
  public date_dernier_ct: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^\d{4}[- ;,/.]\d{2}[- ;,/.]\d{2}$/)
  public date_validite_ct: string;

  @IsOptional()
  @IsBoolean()
  public dvd_player: boolean;

  @IsOptional()
  @IsBoolean()
  public electronic_toll: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  public engine: string;

  @IsOptional()
  @IsBoolean()
  public every_destination: boolean;

  @IsOptional()
  @IsBoolean()
  public fresh_drink: boolean;

  @IsOptional()
  @IsBoolean()
  public gps: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public horodateur: string;

  @IsOptional()
  @IsNumber()
  public horse_power: number;

  @IsOptional()
  @IsInt()
  public id: number;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  public licence_plate: string;

  @IsOptional()
  @IsBoolean()
  public luxury: boolean;

  @IsDefined({ message: `constructor should not be null or undefined` })
  @IsString({ message: `constructor must be a string` })
  @MaxLength(255, {
    message: `constructor must be shorter than or equal to $constraint1 characters`,
  })
  @MinLength(1, {
    message: `constructor must be longer than or equal to $constraint1 characters`,
  })
  @NotContains("legacy-not-provided", {
    message: `constructor should not contain a $constraint1 string`,
  })
  public manufacturer: string; // @note: replaces 'constructor' property to avoid problems with DTO validation at runtime because 'constructor' is a reserved keyword in TypeScript.

  @IsDefined()
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  @NotContains("legacy-not-provided")
  public model: string;

  @IsOptional()
  @IsInt()
  public model_year: number;

  @IsOptional()
  @IsInt()
  public nb_seats: number;

  @IsOptional()
  @IsBoolean()
  public nfc_cc_accepted: boolean;

  @IsOptional()
  @IsBoolean()
  public pet_accepted: boolean;

  @IsOptional()
  @IsBoolean()
  public relais: boolean;

  @IsOptional()
  @IsBoolean()
  public special_need_vehicle: boolean;

  @IsOptional()
  @IsBoolean()
  public tablet: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  public taximetre: string;

  @IsOptional()
  @IsEnum(VehicleTypes)
  public type_: VehicleTypes;

  @IsOptional()
  @IsBoolean()
  public wifi: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  public vehicle_identification_number: string;
}

// eslint-disable-next-line max-classes-per-file
export class VehicleResponseDto {
  public air_con: boolean;
  public amex_accepted: boolean;
  public baby_seat: boolean;
  public bank_check_accepted: boolean;
  public bike_accepted: boolean;
  public color: string;
  public ["constructor"]: any;
  public cpam_conventionne: boolean;
  public credit_card_accepted: boolean;
  public date_dernier_ct: Date;
  public date_validite_ct: Date;
  public dvd_player: boolean;
  public electronic_toll: boolean;
  public engine: string;
  public every_destination: boolean;
  public fresh_drink: boolean;
  public gps: boolean;
  public horodateur: number;
  public horse_power: number;
  public id: number;
  public licence_plate: string;
  public luxury: boolean;
  public model: string;
  public model_year: number;
  public nb_seats: number;
  public nfc_cc_accepted: boolean;
  public pet_accepted: boolean;
  public relais: boolean;
  public special_need_vehicle: boolean;
  public tablet: boolean;
  public taximetre: string;
  public type_: string;
  public wifi: boolean;
  public vehicle_identification_number: string;

  public private = false; // obsolete: keept only to avoid breaking changes
}

export function isLegacyLicensePlate(licence_plate: string): boolean {
  return licence_plate?.search(/^[Tt]/) === 0;
}
