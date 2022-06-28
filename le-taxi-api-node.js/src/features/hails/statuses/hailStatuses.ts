// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from 'lodash';
import { BadRequestError, UnauthorizedError } from '../../errorHandling/errors';

import { addSec, nowUtcIsoString } from '../../shared/dateUtils/dateUtils';
import { UserModel } from '../../users/user.model';
import { ensureCannotAccessTheHailOfSomeoneElse, HailModel, isActive, maxWaitingTimeToRatingRide } from '../hail.model';
import { hailConfig } from '../hailConfig';
import { HailStatus } from './hailStatus.enum';
import { ensureCanPerformTransition } from './hailStatus.fsm';

interface IHailStatus {
  name: string;
  canBeReachedBy: string;
  timeout?: IHailStatusTimeout;
}

interface IHailStatusTimeout {
  timeoutInSec: number;
  timeoutStatus: string;
}

interface IHailStatuses {
  emitted: IHailStatus;
  received: IHailStatus;
  failure: IHailStatus;
  sent_to_operator: IHailStatus;
  received_by_taxi: IHailStatus;
  received_by_operator: IHailStatus;
  accepted_by_taxi: IHailStatus;
  accepted_by_customer: IHailStatus;
  customer_on_board: IHailStatus;
  finished: IHailStatus;
  timeout_taxi: IHailStatus;
  timeout_customer: IHailStatus;
  incident_taxi: IHailStatus;
  incident_customer: IHailStatus;
  declined_by_taxi: IHailStatus;
  declined_by_customer: IHailStatus;
}

export const hailStatuses: IHailStatuses = {
  emitted: {
    name: HailStatus.EMITTED,
    canBeReachedBy: 'moteur',
    timeout: { timeoutInSec: hailConfig.statuses.emitted.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  received: {
    name: HailStatus.RECEIVED,
    canBeReachedBy: 'system',
    timeout: { timeoutInSec: hailConfig.statuses.received.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  sent_to_operator: {
    name: HailStatus.SENT_TO_OPERATOR,
    canBeReachedBy: 'system',
    timeout: { timeoutInSec: hailConfig.statuses.sent_to_operator.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  received_by_operator: {
    name: HailStatus.RECEIVED_BY_OPERATOR,
    canBeReachedBy: 'operateur',
    timeout: { timeoutInSec: hailConfig.statuses.received_by_operator.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  received_by_taxi: {
    name: HailStatus.RECEIVED_BY_TAXI,
    canBeReachedBy: 'operateur',
    timeout: { timeoutInSec: hailConfig.statuses.received_by_taxi.timeoutInSec, timeoutStatus: HailStatus.TIMEOUT_TAXI }
  },
  accepted_by_taxi: {
    name: HailStatus.ACCEPTED_BY_TAXI,
    canBeReachedBy: 'operateur',
    timeout: {
      timeoutInSec: hailConfig.statuses.accepted_by_taxi.timeoutInSec,
      timeoutStatus: HailStatus.TIMEOUT_CUSTOMER
    }
  },
  accepted_by_customer: {
    name: HailStatus.ACCEPTED_BY_CUSTOMER,
    canBeReachedBy: 'moteur',
    timeout: { timeoutInSec: hailConfig.statuses.accepted_by_customer.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  customer_on_board: {
    name: HailStatus.CUSTOMER_ON_BOARD,
    canBeReachedBy: 'operateur',
    timeout: { timeoutInSec: hailConfig.statuses.customer_on_board.timeoutInSec, timeoutStatus: HailStatus.FAILURE }
  },
  finished: { name: HailStatus.FINISHED, canBeReachedBy: 'operateur' },
  timeout_taxi: { name: HailStatus.TIMEOUT_TAXI, canBeReachedBy: 'system' },
  timeout_customer: { name: HailStatus.TIMEOUT_CUSTOMER, canBeReachedBy: 'system' },
  incident_taxi: { name: HailStatus.INCIDENT_TAXI, canBeReachedBy: 'operateur' },
  incident_customer: { name: HailStatus.INCIDENT_CUSTOMER, canBeReachedBy: 'moteur' },
  declined_by_taxi: { name: HailStatus.DECLINED_BY_TAXI, canBeReachedBy: 'operateur' },
  declined_by_customer: { name: HailStatus.DECLINED_BY_CUSTOMER, canBeReachedBy: 'moteur' },
  failure: { name: HailStatus.FAILURE, canBeReachedBy: 'system' }
};

export function getCurrentStatus(hailModel: HailModel, utcNow: string) {
  if (!getTimeout(hailModel)) {
    return hailModel.last_persisted_status;
  }

  const timeoutAt = addSec(hailModel.last_persisted_status_change, getTimeout(hailModel).timeoutInSec);
  if (utcNow > timeoutAt) {
    return getTimeout(hailModel).timeoutStatus;
  }
  return hailModel.last_persisted_status;
}

export function ensureCanBeUpdated(
  currentHail: HailModel,
  targetStatusName: string,
  currentUser: UserModel,
  utcNow: string
) {
  const currentStatus = getCurrentStatus(currentHail, utcNow);
  if (!_.isNil(targetStatusName)) {
    ensureCanPerformTransition(currentStatus, targetStatusName);
    ensureStatusCanBeReachedBy(targetStatusName, currentUser);
  }
  ensureCanBeUpdatedBy(currentHail, currentUser);
}

function getTimeout(hailModel: HailModel) {
  return hailStatuses[hailModel.last_persisted_status].timeout;
}

function ensureCanBeUpdatedBy(hail: HailModel, currentUser: UserModel) {
  ensureCannotAccessTheHailOfSomeoneElse(currentUser, hail);
  if (currentUser.role_name === 'operateur' && hail.last_persisted_status === HailStatus.FINISHED) {
    throw new BadRequestError(`Once finished, a hail cannot be updated by the operator.`);
  }
  if (nowUtcIsoString() > hail.read_only_after) {
    throw new BadRequestError(`The hail ${hail.id} cannot be updated anymore, only read-only access are now allowed.`);
  }
}

function ensureStatusCanBeReachedBy(targetStatus: string, currentUser: UserModel) {
  if (hailStatuses[targetStatus].canBeReachedBy !== currentUser.role_name) {
    throw new UnauthorizedError(`${currentUser.role_name} should not set this status`);
  }
}

export function computeReadOnlyAfter(hailStatus: string, utcNow: string) {
  if (hailStatus === 'finished') {
    return addSec(utcNow, maxWaitingTimeToRatingRide);
  }
  const timeout = hailStatuses[hailStatus].timeout;
  if (timeout) {
    return addSec(utcNow, timeout.timeoutInSec);
  }
  return utcNow; // ex: hailStatus = failure
}
