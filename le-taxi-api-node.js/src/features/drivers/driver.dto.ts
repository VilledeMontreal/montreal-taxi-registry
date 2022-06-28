// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { IsDefined, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { DepartmentDto } from '../departments/department.dto';

export class DriverRequestDto {
  // tslint:disable: variable-name
  @IsOptional()
  public birth_date: string;

  public departement: DepartmentDto;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  public first_name: string;

  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  public last_name: string;

  @IsDefined()
  @IsNotEmpty()
  @MinLength(4)
  public professional_licence: string;
}

// tslint:disable-next-line: max-classes-per-file
export class DriverResponseDto {
  public birth_date: string;
  public departement: DepartmentDto;
  public first_name: string;
  public last_name: string;
  public professional_licence: string;
}

export function isLegacyDepartement(numero: string) {
  return !!('660' === numero);
}
