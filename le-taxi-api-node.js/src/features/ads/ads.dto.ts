// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { OwnerTypes } from "./owner-types.enum";

export class AdsRequestDto {
  // eslint-disable variable-name
  @IsDefined()
  @IsString()
  @MaxLength(255)
  public insee: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  public numero: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  public owner_name: string;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  @IsEnum(OwnerTypes)
  public owner_type: OwnerTypes;

  @IsDefined()
  @IsString()
  @MaxLength(255)
  public category: string;

  @IsOptional()
  @IsBoolean()
  public doublage: boolean;

  @IsOptional()
  @IsInt()
  public vehicle_id: number;

  @ValidateIf((o) => isInseeHasPermitSemanticForADS(o.insee))
  @IsDefined()
  @IsString()
  @MaxLength(255)
  public vdm_vignette: string;
}

export class AdsResponseDto {
  // eslint-disable variable-name
  public insee: string;
  public numero: string;
  public owner_name: string;
  public owner_type: string;
  public category: string;
  public doublage: boolean;
  public vehicle_id: number = null;
  public vdm_vignette: string;
}

export function isInseeHasPermitSemanticForADS(insee: string) {
  return ["102005", "102011", "102012"].includes(insee);
}
