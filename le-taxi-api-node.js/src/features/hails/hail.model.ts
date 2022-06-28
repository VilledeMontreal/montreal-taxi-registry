// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import booleanContains from '@turf/boolean-contains';
import * as turf from '@turf/helpers';
import * as _ from 'lodash';
import * as shortId from 'shortid';
import { TaxiStatus } from '../../libs/taxiStatus';
import { BadRequestError, UnauthorizedError } from '../errorHandling/errors';
import { YUL_HAIL_TAXI_RESTRICTED_AREA } from '../inquiry/inquiryRestrictedArea';
import { LatestTaxiPositionModel } from '../latestTaxiPositions/latestTaxiPosition.model';
import { ICoordinates } from '../shared/coordinates/coordinates';
import { nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { isInEnum } from '../shared/enumUtil/validateEnum';
import { validateUndefined } from '../shared/validations/validators';
import { UserModel } from '../users/user.model';
import {
  CreateHailRequestDto,
  MotorUpdateHailRequestDto,
  OperatorHailResponseDto,
  OperatorUpdateHailRequestDto
} from './hail.dto';
import { IncidentTaxiReason } from './HailIncidentTaxiReason.enum';
import { RatingRideReason } from './hailRatingRideReason.enum';
import { ReportingCustomerReason } from './hailReportingCustomerReason.enum';
import { HailActiveStatus } from './statuses/hailActiveStatus.enum';
import { HailStatus } from './statuses/hailStatus.enum';
import { computeReadOnlyAfter, ensureCanBeUpdated } from './statuses/hailStatuses';

import moment = require('moment');

// tslint:disable: variable-name
export class HailModel {
  // context
  public id: string;
  public added_by: number;
  public taxi_id: string;
  public operateur_id: number;

  // motor
  public customer_address: string;
  public customer_phone_number: string;
  public customer_lat: number;
  public customer_lon: number;
  public rating_ride: number;
  public rating_ride_reason: string;
  public incident_customer_reason: string; // ensure always empty string, but keep the attribute.

  // operator
  public taxi_phone_number: string;
  public incident_taxi_reason: string;
  public reporting_customer: boolean;
  public reporting_customer_reason: string;

  // status
  public last_persisted_status: string;
  public last_persisted_status_change: string; // update each time last_persisted_status has changed: used for timeouts

  // status history
  public change_to_accepted_by_customer: string;
  public change_to_accepted_by_taxi: string;
  public change_to_declined_by_customer: string;
  public change_to_declined_by_taxi: string;
  public change_to_failure: string;
  public change_to_incident_customer: string;
  public change_to_incident_taxi: string;
  public change_to_received_by_operator: string;
  public change_to_received_by_taxi: string;
  public change_to_sent_to_operator: string;
  public change_to_customer_on_board: string;
  public change_to_finished: string;
  public read_only_after: string;

  // audit
  public creation_datetime: string;
  public last_update_at: string; // update each time any attribute has changed: used for optmistic lock
}

export const ANONYMOUS_CUSTOMER_ID = 'anonymous';
export const maxWaitingTimeToRatingRide = 3600;

// it is assumed that dto is valid
export function createHailModel(
  command: CreateHailRequestDto,
  motor: UserModel,
  operator: UserModel,
  latestTaxiPosition: LatestTaxiPositionModel,
  utcNow: string
): HailModel {
  validateOperator(operator);
  validateFieldAnonymous(command.customer_id);
  validateYulHailTaxiRestrictedArea({ lon: command.customer_lon, lat: command.customer_lat });
  validateLatestTaxiPosition(latestTaxiPosition, utcNow);

  const hailModelCreated = new HailModel();

  // context
  hailModelCreated.id = shortId.generate();
  hailModelCreated.added_by = Number(motor.id);
  hailModelCreated.taxi_id = command.taxi_id;
  hailModelCreated.operateur_id = Number(operator.id);

  // motor
  hailModelCreated.customer_address = defaultIfUndefined(null, command.customer_address);
  hailModelCreated.customer_phone_number = defaultIfUndefined(null, command.customer_phone_number);
  hailModelCreated.customer_lat = command.customer_lat;
  hailModelCreated.customer_lon = command.customer_lon;
  hailModelCreated.rating_ride = null;
  hailModelCreated.rating_ride_reason = null;
  hailModelCreated.incident_customer_reason = null;

  // operator
  hailModelCreated.taxi_phone_number = null;
  hailModelCreated.incident_taxi_reason = null;
  hailModelCreated.reporting_customer = null;
  hailModelCreated.reporting_customer_reason = null;

  // status
  hailModelCreated.last_persisted_status = HailStatus.EMITTED;
  hailModelCreated.last_persisted_status_change = utcNow;

  // status history
  hailModelCreated.change_to_accepted_by_customer = null;
  hailModelCreated.change_to_accepted_by_taxi = null;
  hailModelCreated.change_to_declined_by_customer = null;
  hailModelCreated.change_to_declined_by_taxi = null;
  hailModelCreated.change_to_failure = null;
  hailModelCreated.change_to_incident_customer = null;
  hailModelCreated.change_to_incident_taxi = null;
  hailModelCreated.change_to_received_by_operator = null;
  hailModelCreated.change_to_received_by_taxi = null;
  hailModelCreated.change_to_sent_to_operator = null;
  hailModelCreated.change_to_customer_on_board = null;
  hailModelCreated.change_to_finished = null;
  hailModelCreated.read_only_after = computeReadOnlyAfter(HailStatus.EMITTED, utcNow);

  // audit
  hailModelCreated.creation_datetime = utcNow;
  hailModelCreated.last_update_at = utcNow;

  return hailModelCreated as HailModel;
}

export function updateBySystem(
  currentState: HailModel,
  targetStatus: HailStatus,
  utcNow: string,
  userModel?: UserModel
): HailModel {
  ensureCanBeUpdated(currentState, targetStatus, userModel, nowUtcIsoString());
  const model = _.cloneDeep(currentState);
  setLastPersistedStatus(model, targetStatus, utcNow);
  model.last_update_at = utcNow;

  return model;
}

export function updateByOperator(
  currentState: HailModel,
  request: OperatorUpdateHailRequestDto,
  utcNow: string,
  userModel: UserModel
): HailModel {
  if (request.incident_taxi_reason) {
    validateReason(request.incident_taxi_reason, IncidentTaxiReason);
  }

  if (request.reporting_customer) {
    validateReason(request.reporting_customer_reason, ReportingCustomerReason);
  }

  ensureCanBeUpdated(currentState, request.status, userModel, nowUtcIsoString());
  ensurecanBeSetRatingRide(userModel, request);

  const model = _.cloneDeep(currentState);
  setLastPersistedStatus(model, request.status, utcNow);
  model.taxi_phone_number = patch(currentState.taxi_phone_number, request.taxi_phone_number);
  if (request.status === HailStatus.INCIDENT_TAXI) {
    model.incident_taxi_reason = patch(currentState.incident_taxi_reason, request.incident_taxi_reason);
  }
  model.reporting_customer = patch(currentState.reporting_customer, request.reporting_customer);
  model.reporting_customer_reason = patch(currentState.reporting_customer_reason, request.reporting_customer_reason);
  model.last_update_at = utcNow;

  return model;
}

export function updateByMotor(
  currentState: HailModel,
  request: MotorUpdateHailRequestDto,
  utcNow: string,
  userModel: UserModel
): HailModel {
  validateRatingTaxi(request.rating_ride);
  validateReason(request.rating_ride_reason, RatingRideReason);
  ensureCanBeUpdated(currentState, request.status, userModel, nowUtcIsoString());
  ensurecanBeSetRatingRide(userModel, request);

  const model = _.cloneDeep(currentState);
  setLastPersistedStatus(model, request.status, utcNow);
  model.rating_ride = patch(currentState.rating_ride, request.rating_ride);
  model.rating_ride_reason = patch(currentState.rating_ride_reason, request.rating_ride_reason);
  model.last_update_at = utcNow;

  return model;
}

export function updateByOperatorHailResponse(
  currentState: HailModel,
  operatorHailResponseDto: OperatorHailResponseDto,
  utcNow: string,
  userModel: UserModel
): HailModel {
  ensureCanBeUpdated(currentState, HailStatus.RECEIVED_BY_OPERATOR, userModel, nowUtcIsoString());
  ensurecanBeSetRatingRide(userModel, operatorHailResponseDto);

  const model = _.cloneDeep(currentState);
  setLastPersistedStatus(model, HailStatus.RECEIVED_BY_OPERATOR, utcNow);
  model.taxi_phone_number = patch(currentState.taxi_phone_number, operatorHailResponseDto.taxi_phone_number);
  model.last_update_at = utcNow;

  return model;
}

function setLastPersistedStatus(currentState: HailModel, targetStatus: string, utcNow: string) {
  if (targetStatus && currentState.last_persisted_status !== targetStatus) {
    currentState.read_only_after = computeReadOnlyAfter(targetStatus, utcNow);
    currentState.last_persisted_status = targetStatus;
    currentState[`change_to_${targetStatus}`] = utcNow;
    currentState.last_persisted_status_change = utcNow;
  }
}

function patch<T>(currentValue: T, newValue: T): T {
  return _.isUndefined(newValue) ? currentValue : newValue;
}

function defaultIfUndefined<T>(defaultValue: T, initialValue: T): T {
  return _.isUndefined(initialValue) ? defaultValue : initialValue;
}

function validateLatestTaxiPosition(latestTaxiPosition: LatestTaxiPositionModel, utcNow: string) {
  if (_.isNil(latestTaxiPosition)) {
    throw new BadRequestError(`The taxi is not available for hailing (taxi without status).`);
  }

  if (latestTaxiPosition.status !== TaxiStatus.Free) {
    throw new BadRequestError(`The taxi is not available for hailing (taxi is not free).`);
  }

  const maxWaitingTime = 120; // in seconds
  const datePersisted = moment(latestTaxiPosition.timestampUnixTime * 1000); // time in milisec
  const dateNow = moment(new Date(utcNow));

  if (dateNow.diff(datePersisted, 'seconds') > maxWaitingTime) {
    throw new BadRequestError(`The taxi is not available for hailing (taxi status timestamp is too old)`);
  }
}

function validateOperator(operator: UserModel) {
  validateUndefined(operator.operator_api_key, `${operator.email} cannot receive hails`);
  validateUndefined(operator.hail_endpoint_production, `${operator.email} cannot receive hails`);
}

function validateFieldAnonymous(customerId: string) {
  if (customerId !== ANONYMOUS_CUSTOMER_ID) {
    throw new BadRequestError(`The customer_id must be anonymous`);
  }
}

export function validateYulHailTaxiRestrictedArea(coordinate: ICoordinates): void {
  const yulTaxiRestrictedArea = turf.polygon([YUL_HAIL_TAXI_RESTRICTED_AREA], { name: 'yul-taxi-restricted-area' });
  const userPosition = turf.point([coordinate.lon, coordinate.lat]);
  const isPointContain = booleanContains(yulTaxiRestrictedArea, userPosition);

  if (isPointContain) {
    const NEAR_AIRPORT_ERROR_MSG = `Searching or hailing a taxi from the Montreal airport (YUL) zone is prohibited.`;
    throw new BadRequestError(NEAR_AIRPORT_ERROR_MSG);
  }
}

export function isActive(status: string): boolean {
  return isInEnum(status, HailActiveStatus);
}

export function ensureCannotAccessTheHailOfSomeoneElse(currentUser: UserModel, currentHail: HailModel) {
  if (['admin', 'system'].includes(currentUser.role_name)) {
    return;
  }
  if (![currentHail.operateur_id, currentHail.added_by].includes(Number(currentUser.id))) {
    throw new UnauthorizedError(`You don't have the authorization to treat this hail`);
  }
}

function validateRatingTaxi(value) {
  if (!value) {
    return;
  }
  if (value > 5 && value < 1) {
    throw new BadRequestError(`Rating must be between 1 to 5`);
  }
}

function validateReason(ratingReason: string, enumReason: any) {
  if (!ratingReason) {
    return;
  }
  if (!isInEnum(ratingReason, enumReason)) {
    throw new BadRequestError(`Reason does not exists`);
  }
}

function ensurecanBeSetRatingRide(user: UserModel, request: any) {
  if (request.rating_ride && user.role_name !== 'moteur') {
    throw new UnauthorizedError(`Only Motor must be set Rating ride`);
  }
}
