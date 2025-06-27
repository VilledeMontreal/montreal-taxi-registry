// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { taxiAreasService } from "../../services/taxi-areas.service";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { taxiAreasUrl } from "./taxiAreas.config";

class TaxiAreasController {
  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getTaxiAreas(req: Request, res: Response, next: NextFunction) {
    const response = await taxiAreasService.getTaxiAreas(taxiAreasUrl);

    res.status(StatusCodes.OK).send(response);
  }
}

export const taxiAreasController = new TaxiAreasController();
