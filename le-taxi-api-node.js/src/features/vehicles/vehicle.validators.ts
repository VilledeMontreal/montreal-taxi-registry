// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import * as _ from 'lodash';
import {
  validateArrayLimit,
  validateArrayNotEmpty,
  validateDtoProperties,
  validateIsPropertyNull4ReservedField
} from '../shared/validations/validators';
import { VehicleRequestDto } from './vehicle.dto';

export async function validateRequest(request: Request): Promise<VehicleRequestDto> {
  const requestJsonData = request.body.data;
  validateArrayNotEmpty(requestJsonData);
  validateArrayLimit(requestJsonData, 1);
  validateIsPropertyNull4ReservedField(requestJsonData, 'constructor');

  const vehicleRequestDto = correctVehicleDto(requestJsonData[0]);
  await validateDtoProperties(new VehicleRequestDto(), vehicleRequestDto);
  return vehicleRequestDto;
}

function correctVehicleDto(originalVehicleDto: VehicleRequestDto): VehicleRequestDto {
  const correctedVehicleDto = _.clone(originalVehicleDto);
  const correctedVehicleDtoKeys = Object.keys(correctedVehicleDto);

  if (correctedVehicleDtoKeys.includes('constructor')) {
    correctedVehicleDto.manufacturer = _.get(correctedVehicleDto, 'constructor');
    _.unset(correctedVehicleDto, 'constructor');
  }
  return correctedVehicleDto;
}
