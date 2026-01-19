// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import {
  validateArrayLimit,
  validateArrayNotEmpty,
  validateDtoProperties,
} from "../shared/validations/validators";
import { VehicleRequestDto } from "./vehicle.dto";

export async function validateRequest(
  request: Request,
): Promise<VehicleRequestDto> {
  const requestJsonData = request.body.data;
  validateArrayNotEmpty(requestJsonData);
  validateArrayLimit(requestJsonData, 1);

  await validateDtoProperties(new VehicleRequestDto(), requestJsonData[0]);
  return requestJsonData[0];
}
