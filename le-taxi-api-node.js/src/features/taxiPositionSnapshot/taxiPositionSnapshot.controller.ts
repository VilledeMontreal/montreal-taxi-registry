// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as promClient from "prom-client";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { taxiPositionSnapshotService } from "./taxiPositionSnapshot.service";
import {
  validateTaxiOwnership,
  validateTaxiPositionSnapshot,
} from "./taxiPositionSnapshot.validators";

const counter = new promClient.Counter({
  name: "taxi_position_operator_count",
  help: "successful http post request for taxi positions",
  labelNames: ["operator"],
});

class TaxiPositionSnapshotController {
  @allow([UserRole.Operator])
  public async addTaxiPositionSnapshot(req: any, res: Response): Promise<any> {
    const taxiPositionSnapshot: any = req.body;
    validateTaxiPositionSnapshot(taxiPositionSnapshot, req.userModel);
    await validateTaxiOwnership(taxiPositionSnapshot, req.userModel.id);
    await taxiPositionSnapshotService.addTaxiPositionSnapshotInMongoDb(
      taxiPositionSnapshot,
      req.userModel
    );
    counter.labels(req.body.items[0].operator).inc(req.body.items.length);
    res.status(StatusCodes.OK);
    res.end();
  }
}

export const taxiPositionSnapshotController =
  new TaxiPositionSnapshotController();
