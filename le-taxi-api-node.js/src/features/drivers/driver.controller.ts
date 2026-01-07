// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CSVGenerator } from "../../libs/CSVGenerator";
import { created, ok } from "../shared/actionMethods";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { getOperator } from "../shared/utils/requestUtils";
import { validateRequest } from "../shared/validations/validateRequest";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { driverDataAccessLayer } from "./driver.dal";
import { DriverRequestDto } from "./driver.dto";

class DriversController {
  @allow([UserRole.Admin, UserRole.Operator])
  public async upsertDrivers(request: Request, response: Response) {
    const driverRequestDto = await validateRequest(
      request,
      new DriverRequestDto(),
    );
    const upsertedDriver = await driverDataAccessLayer.upsertDriver(
      driverRequestDto,
      request.userModel,
    );
    const driverResponseDto = await driverDataAccessLayer.getDriverById(
      upsertedDriver.entityId as string,
    );
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    upsertedDriver.dataOperation === DataOperation.Create
      ? created(response, driverResponseDto)
      : ok(response, driverResponseDto);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getDrivers(request: Request, response: Response) {
    const operator = getOperator(request);
    const driverId = request.query.id as string;
    if (driverId) {
      const driver = await driverDataAccessLayer.getDriverById(
        driverId,
        operator,
      );
      response.status(StatusCodes.OK);
      response.json(driver);
    } else {
      const drivers = await driverDataAccessLayer.getDriversPaginated({
        order: request.query.order as string,
        filter: request.query.filter as string,
        operator,
        page: request.query.page as string,
        pageSize: request.query.pagesize as string,
      });
      response.status(StatusCodes.OK);
      response.json(drivers);
    }
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getDriversCount(request: Request, response: Response) {
    const operator = getOperator(request);
    const count = await driverDataAccessLayer.getDriversCount({
      filter: request.query.filter as string,
      operator,
    });
    response.status(StatusCodes.OK);
    response.json(count);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getDriversCsv(request: Request, response: Response) {
    const generator = new CSVGenerator(response);
    const drivers = await driverDataAccessLayer.getDriversPaginated({
      order: request.query.order as string,
      filter: request.query.filter as string,
      operator: request.query.operator as string,
    });
    generator.DownloadCSV(drivers, "Extraction Chauffeurs");
  }
}

export const driverController = new DriversController();
