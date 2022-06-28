// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  validate,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsDate,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
  IsDefined
} from 'class-validator';

export class DriverModel {
  constructor() {}

  @IsOptional()
  @IsInt()
  id: number;

  departement_id: string;

  @IsOptional()
  birth_date: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  first_name: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  last_name: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(4)
  professional_licence: string;

  added_by: number;
  added_at: Date;
  added_via: string;
  source: string;
  last_update_at: Date;

  //grid Fields
  added_By_name: string;
}
