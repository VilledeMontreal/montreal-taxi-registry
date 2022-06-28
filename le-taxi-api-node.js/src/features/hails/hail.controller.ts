// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from 'express';
import * as promClient from 'prom-client';
import { BadRequestError, NotFoundError } from '../errorHandling/errors';
import { LatestTaxiPositionModel, latestTaxiPositionNull } from '../latestTaxiPositions/latestTaxiPosition.model';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { created, ok } from '../shared/actionMethods';
import { nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { validateRequest } from '../shared/validations/validateRequest';
import { validateUndefined } from '../shared/validations/validators';
import { taxiDataAccessLayer } from '../taxis/taxi.dal';
import { allow } from '../users/securityDecorator';
import { systemUser } from '../users/systemUser';
import { UserModel } from '../users/user.model';
import { userRepository } from '../users/user.repository';
import {
  CreateHailRequestDto,
  HailResponseDto,
  MotorUpdateHailRequestDto,
  OperatorHailResponseDto,
  OperatorUpdateHailRequestDto
} from './hail.dto';
import { HailDtoMapper } from './hail.dtoMapper';
import {
  createHailModel,
  ensureCannotAccessTheHailOfSomeoneElse,
  HailModel,
  isActive,
  updateByMotor,
  updateByOperator,
  updateByOperatorHailResponse,
  updateBySystem
} from './hail.model';
import { hailRepository } from './hail.repository';
import { operatorApiClient } from './operator.apiClient';
import { HailStatus } from './statuses/hailStatus.enum';
import { getCurrentStatus } from './statuses/hailStatuses';

const counter = new promClient.Counter({
  name: 'http_hail_failure',
  help: 'http failure when creating hail',
  labelNames: ['operator']
});

class HailController {
  @allow(['admin', 'moteur'])
  public async postHail(request: Request, response: Response, next: NextFunction) {
    const requestDto = await validateRequest(request, new CreateHailRequestDto());

    const [operator, taxiLatestPosition] = await Promise.all([
      this.loadTaxiOperator(requestDto.taxi_id),
      latestTaxiPositionRepository.getLatestTaxiPositionByTaxiId(requestDto.taxi_id)
    ]);

    const emittedHail = createHailModel(requestDto, request.userModel, operator, taxiLatestPosition, nowUtcIsoString());

    const receivedHail = updateBySystem(emittedHail, HailStatus.RECEIVED, nowUtcIsoString(), systemUser);
    await hailRepository.saveHail(receivedHail, null);

    const responseDto = await this.loadHailResponseDto(receivedHail);
    created(response, responseDto);

    await this.sendHailToOperator(responseDto, receivedHail, operator);
  }

  @allow(['admin', 'moteur', 'operateur', 'gestion'])
  public async getHail(request: Request, response: Response, next: NextFunction) {
    validateUndefined(request.params.id, 'hailId');

    const hail = await hailRepository.getHailById(request.params.id);
    if (!hail) {
      throw new NotFoundError(`Unable to find hail`);
    }
    ensureCannotAccessTheHailOfSomeoneElse(request.userModel, hail);

    const responseDto = await this.loadHailResponseDto(hail);
    ok(response, responseDto);
  }

  @allow(['operateur', 'moteur'])
  public async updateHail(request: Request, response: Response, next: NextFunction) {
    validateUndefined(request.params.id, 'hailId');

    const currentHail = await hailRepository.getHailById(request.params.id);
    if (!currentHail) {
      throw new BadRequestError(`The hail (${request.params.id}) does not exist.`);
    }

    const updatedHail = await this.updateHailByRole(currentHail, request);
    await hailRepository.saveHail(updatedHail, currentHail.last_update_at);

    const responseDto = await this.loadHailResponseDto(updatedHail);
    ok(response, responseDto);

    if (updatedHail.last_persisted_status === HailStatus.FINISHED) {
      await this.setRatingTaxi(updatedHail.taxi_id);
    }
  }

  private async updateHailByRole(currentState: HailModel, request: Request): Promise<HailModel> {
    if (request.userModel.role_name === 'moteur') {
      const requestDto = await validateRequest(request, new MotorUpdateHailRequestDto());
      return updateByMotor(currentState, requestDto, nowUtcIsoString(), request.userModel);
    }
    if (request.userModel.role_name === 'operateur') {
      const requestDto = await validateRequest(request, new OperatorUpdateHailRequestDto());
      return updateByOperator(currentState, requestDto, nowUtcIsoString(), request.userModel);
    }

    throw new Error('Should never reach this line because only moteur and operateur can update a hail');
  }

  private async loadHailResponseDto(model: HailModel): Promise<HailResponseDto> {
    const [operator, taxiLatestPosition, taxiRelationAndVignette] = await Promise.all([
      userRepository.getUserById(model.operateur_id.toString()),
      this.loadLatestPosition(model),
      taxiDataAccessLayer.getTaxiRelationAndVignette(model.taxi_id)
    ]);

    return HailDtoMapper.toHailResponseDto(model, operator, taxiLatestPosition, taxiRelationAndVignette);
  }

  private async sendHailToOperator(
    responseDto: HailResponseDto,
    receivedHail: HailModel,
    operator: UserModel
  ): Promise<void> {
    const hailSentToOperator = updateBySystem(receivedHail, HailStatus.SENT_TO_OPERATOR, nowUtcIsoString(), systemUser);

    const [, operatorHailResponse] = await Promise.all([
      hailRepository.saveHail(hailSentToOperator, receivedHail.last_update_at),
      this.postHailWithErrorHandling(responseDto, operator)
    ]);

    const hailReceivedByOperator = updateByOperatorHailResponse(
      hailSentToOperator,
      operatorHailResponse,
      nowUtcIsoString(),
      operator
    );
    await hailRepository.saveHail(hailReceivedByOperator, hailSentToOperator.last_update_at);
  }

  private async postHailWithErrorHandling(
    responseDto: HailResponseDto,
    operator: UserModel
  ): Promise<OperatorHailResponseDto> {
    try {
      return await operatorApiClient.postHail(responseDto, operator);
    } catch (err) {
      counter.inc({
        operator: operator.email
      });

      throw err;
    }
  }

  private async loadTaxiOperator(taxiId: string) {
    const operatorId = await taxiDataAccessLayer.getTaxiOperatorId(taxiId);
    return await userRepository.getUserById(operatorId.toString());
  }

  private async loadLatestPosition(hail: HailModel): Promise<LatestTaxiPositionModel> {
    const utcNow = nowUtcIsoString();
    const currenStatus = getCurrentStatus(hail, utcNow);

    if (!isActive(currenStatus)) {
      return latestTaxiPositionNull;
    }
    return await latestTaxiPositionRepository.getLatestTaxiPositionByTaxiId(hail.taxi_id);
  }

  private async setRatingTaxi(taxiId: string) {
    const ratingAverage = await hailRepository.getTaxiAverageRating(taxiId);

    await taxiDataAccessLayer.updateRatingTaxi(taxiId, ratingAverage);
  }
}

export const hailController = new HailController();
