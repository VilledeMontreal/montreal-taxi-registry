// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import {
  validateArrayLimit,
  validateArrayNotEmpty,
  validateDtoProperties,
} from "./validators";

export async function validateRequest<T extends object>(
  request: Request,
  dtoRequest: T
): Promise<T> {
  const data =
    request && request.body && request.body.data ? request.body.data : [];

  validateArrayNotEmpty(data);
  validateArrayLimit(data, 1);
  await validateDtoProperties(dtoRequest, data[0]);
  return dtoRequest;
}
