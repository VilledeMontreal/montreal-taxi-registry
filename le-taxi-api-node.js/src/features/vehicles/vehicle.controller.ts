// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CSVGenerator } from "../../libs/CSVGenerator";
import { created, ok } from "../shared/actionMethods";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { getOperator } from "../shared/utils/requestUtils";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { vehicleDataAccessLayer } from "./vehicle.dal";
import { validateRequest } from "./vehicle.validators";

class VehiclesController {
  @allow([UserRole.Admin, UserRole.Operator])
  public async upsertVehicles(request: Request, response: Response) {
    const vehicleRequestDto = await validateRequest(request);
    const upsertedVehicle = await vehicleDataAccessLayer.upsertVehicle(
      vehicleRequestDto,
      request.userModel,
    );
    const vehicleResponseDto = await vehicleDataAccessLayer.getVehicleById(
      upsertedVehicle.entityId as string,
    );
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    upsertedVehicle.dataOperation === DataOperation.Create
      ? created(response, vehicleResponseDto)
      : ok(response, vehicleResponseDto);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getVehicles(request: Request, response: Response) {
    const operator = getOperator(request);
    const vehicleId = request.query.id as string;
    if (vehicleId) {
      const vehicle = await vehicleDataAccessLayer.getVehicleById(
        vehicleId,
        operator,
      );
      response.status(StatusCodes.OK);
      response.json(vehicle);
    } else {
      const vehicles = await vehicleDataAccessLayer.getVehiclesPaginated({
        order: request.query.order as string,
        filter: request.query.filter as string,
        operator,
        page: request.query.page as string,
        pageSize: request.query.pagesize as string,
      });
      response.status(StatusCodes.OK);
      response.json(vehicles);
    }
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getVehiclesCount(request: Request, response: Response) {
    const operator = getOperator(request);
    const count = await vehicleDataAccessLayer.getVehiclesCount({
      filter: request.query.filter as string,
      operator,
    });
    response.status(StatusCodes.OK);
    response.json(count);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getVehiclesCsv(request: Request, response: Response) {
    const generator = new CSVGenerator(response);
    const vehicles = await vehicleDataAccessLayer.getVehiclesPaginated({
      order: request.query.order as string,
      filter: request.query.filter as string,
      operator: request.query.operator as string,
    });
    generator.DownloadCSV(vehicles, "Extraction Véhicule");
  }
}

export const vehiclesController = new VehiclesController();
