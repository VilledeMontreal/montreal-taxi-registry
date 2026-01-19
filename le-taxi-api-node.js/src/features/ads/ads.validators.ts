// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import { validateRequest } from "../shared/validations/validateRequest";
import { AdsRequestDto, isInseeHasPermitSemanticForADS } from "./ads.dto";

export async function validateAdsRequest(
  request: Request,
  dtoRequest: AdsRequestDto,
): Promise<any> {
  const requestValid = await validateRequest(request, dtoRequest);
  if (isInseeHasPermitSemanticForADS(requestValid.insee)) {
    return requestValid;
  }

  requestValid.vdm_vignette = requestValid.numero;

  return requestValid;
}
