// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { created, ok } from "../shared/actionMethods";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { adsDataAccessLayer } from "./ads.dal";
import { AdsRequestDto } from "./ads.dto";
import { validateAdsRequest } from "./ads.validators";

class AdsController {
  @allow([UserRole.Admin, UserRole.Operator])
  public async upsertAds(request: Request, response: Response) {
    const adsRequestDto = await validateAdsRequest(
      request,
      new AdsRequestDto(),
    );
    const upsertedAds = await adsDataAccessLayer.upsertAds(
      adsRequestDto,
      request.userModel,
    );
    const adsResponseDto = await adsDataAccessLayer.getAdsById(
      Number(upsertedAds.entityId),
    );
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    upsertedAds.dataOperation === DataOperation.Create
      ? created(response, adsResponseDto)
      : ok(response, adsResponseDto);
  }
}

export const adsController = new AdsController();
