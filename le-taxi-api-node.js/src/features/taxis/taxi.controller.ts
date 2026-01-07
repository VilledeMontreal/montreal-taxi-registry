// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CSVGenerator } from "../../libs/CSVGenerator";
import { latestTaxiPositionRepository } from "../latestTaxiPositions/latestTaxiPosition.repository";
import { created, ok } from "../shared/actionMethods";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { allow } from "../users/securityDecorator";
import { UserRole } from "../users/userRole";
import { taxiDataAccessLayer } from "./taxi.dal";
import {
  validateDeprecatedUpdateRequest,
  validateTaxiRequest,
} from "./taxi.validators";

class TaxisController {
  @allow([UserRole.Admin, UserRole.Operator])
  public async getTaxiById(request: Request, response: Response) {
    const taxiId = request.params.id;
    const taxiResponseDto = await taxiDataAccessLayer.getTaxiById(
      taxiId,
      request.userModel,
    );
    ok(response, taxiResponseDto);
  }

  @allow([UserRole.Admin, UserRole.Operator])
  public async upsertTaxis(request: Request, response: Response) {
    const taxiRequestDto = await validateTaxiRequest(request);
    const upsertedTaxi = await taxiDataAccessLayer.upsertTaxi(
      taxiRequestDto,
      request.userModel,
    );
    const taxiResponseDto = await taxiDataAccessLayer.getTaxiById(
      upsertedTaxi.entityId.toString(),
    );
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    upsertedTaxi.dataOperation === DataOperation.Create
      ? created(response, taxiResponseDto)
      : ok(response, taxiResponseDto);
  }

  @allow([UserRole.Admin, UserRole.Operator])
  public async updateTaxi(request: Request, response: Response) {
    const taxiId = request.params.id;
    const taxiRequestDto = await validateDeprecatedUpdateRequest(request);
    await taxiDataAccessLayer.updateTaxiById(taxiId, taxiRequestDto.private);
    const taxiResponseDto = await taxiDataAccessLayer.getTaxiById(
      taxiId,
      request.userModel,
    );
    ok(response, taxiResponseDto);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getTaxis(request: Request, response: Response) {
    const taxiId = request.query.id as string;
    if (taxiId) {
      const taxi = await taxiDataAccessLayer.getTaxiById(taxiId);
      response.status(StatusCodes.OK);
      response.json(taxi);
    } else {
      const taxis = await taxiDataAccessLayer.getTaxisPaginated({
        order: request.query.order as string,
        filter: request.query.filter as string,
        operator: request.query.operator as string,
        page: request.query.page as string,
        pageSize: request.query.pagesize as string,
      });
      response.status(StatusCodes.OK);
      response.json(taxis);
    }
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getTaxisCount(request: Request, response: Response) {
    const count = await taxiDataAccessLayer.getTaxisCount({
      filter: request.query.filter as string,
      operator: request.query.operator as string,
    });
    response.status(StatusCodes.OK);
    response.json(count);
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getTaxisCsv(request: Request, response: Response) {
    const generator = new CSVGenerator(response);
    const taxis = await taxiDataAccessLayer.getTaxisPaginated({
      order: request.query.order as string,
      filter: request.query.filter as string,
      operator: request.query.operator as string,
    });
    generator.DownloadCSV(taxis, "Extraction Taxis");
  }

  @allow([UserRole.Admin, UserRole.Manager, UserRole.Inspector])
  public async getTaxisActif(request: Request, response: Response) {
    const taxisActif =
      await latestTaxiPositionRepository.getLatestTaxiPositions();
    response.status(StatusCodes.OK);
    response.json(taxisActif.map((actif) => actif.taxi.id));
  }
}

export const taxiController = new TaxisController();
