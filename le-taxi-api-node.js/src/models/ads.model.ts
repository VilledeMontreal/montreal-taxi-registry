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
  IsDefined,
  IsBoolean
} from 'class-validator';

export class ADSModel {
  constructor(
    insee?: string,
    numero?: string,
    owner_name?: string,
    owner_type?: string,
    category?: string,
    doublage?: boolean,
    vdm_vignette?: string
  ) {
    this.insee = insee;
    this.numero = numero;
    this.owner_name = owner_name;
    this.owner_type = owner_type;
    this.category = category;
    this.doublage = doublage;
    this.vehicle_id = null;
    this.vdm_vignette = vdm_vignette;
  }

  @IsOptional()
  @IsInt()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  numero: string;

  @IsBoolean()
  doublage: boolean;

  added_at: string;
  added_by: string;
  added_via: string;
  source: string;

  @IsOptional()
  @IsInt()
  vehicle_id: string;

  last_update_at: string;

  @IsDefined()
  @IsNotEmpty()
  insee: string;

  category: string;
  owner_name: string;
  owner_type: string;
  zupc_id: string;

  @IsDefined()
  @IsNotEmpty()
  vdm_vignette: string;
}
