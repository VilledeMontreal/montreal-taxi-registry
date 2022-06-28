// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { generateNorthShoreLat, generateNorthShoreLon } from '../../shared/commonLoadTests/specialRegion';
import { getCurrentUnixTime } from '../../shared/commonTests/testUtil';
import { copyTaxiPositionTemplate } from '../../taxiPositionSnapShots/taxiPositionSnapShotsDto.template';
import { copyHailStatusTemplate, copyHailTemplate } from '../hailDto.template';
import { IHailToLoad } from './iHailToLoad';

const hailsSharedStateJson = require('fs').readFileSync('src/hails/loadTests/hail.sharedState.json');
const _sharedState: IHailToLoad = JSON.parse(hailsSharedStateJson);
let _maximumNumberOfTaxis: number = null;
let _currentTaxiIndex: number = 0;

export function initializeMaximumNumberOfTaxis(maximumNumberOfTaxis: number) {
  _maximumNumberOfTaxis = maximumNumberOfTaxis;
}

export function beforeRequest(requestParams: any, context: any, ee: any, next: any) {
  if (_currentTaxiIndex % _maximumNumberOfTaxis === 0) {
    _currentTaxiIndex = 0;
  }

  context.vars.motorApikey = _sharedState.motor.apiKey;
  context.vars.operatorApikey = _sharedState.operator.apiKey;
  context.vars.emulateDelayCausedOperatorServerHandlingPostHail = 1;
  // This is a weakness in the hail process,
  // because this delay could be < 1 sec in a real scenario.
  // This is problematic, especially under heavy load where
  // the taxi registry may takes a few secondes to mutuate from
  // one state to the next.
  // For more information, see https://jira.montreal.ca/browse/TM-1517
  context.vars.emulateDelayCausedOperatorServerCommunicatingWithTaxi = 1;

  context.vars.hail = copyHailTemplate(x => {
    x.data[0].customer_lat = generateNorthShoreLat();
    x.data[0].customer_lon = generateNorthShoreLon();
    x.data[0].operateur = _sharedState.operator.email;
    x.data[0].taxi_id = _sharedState.taxis[_currentTaxiIndex].id;
  });

  context.vars.snapshot = copyTaxiPositionTemplate(x => {
    x.items[0].taxi = _sharedState.taxis[_currentTaxiIndex].id;
    x.items[0].operator = _sharedState.operator.email;
    x.items[0].status = 'free';
    x.items[0].lat = generateNorthShoreLat();
    x.items[0].lon = generateNorthShoreLon();
    x.items[0].timestamp = getCurrentUnixTime();
  });

  context.vars.receivedByTaxi = copyHailStatusTemplate(x => {
    x.data[0].status = 'received_by_taxi';
  });

  context.vars.acceptedByTaxi = copyHailStatusTemplate(x => {
    x.data[0].status = 'accepted_by_taxi';
  });

  context.vars.acceptedByCustomer = copyHailStatusTemplate(x => {
    x.data[0].status = 'accepted_by_customer';
  });

  context.vars.customerOnBoard = copyHailStatusTemplate(x => {
    x.data[0].status = 'customer_on_board';
  });

  context.vars.finished = copyHailStatusTemplate(x => {
    x.data[0].status = 'finished';
  });

  _currentTaxiIndex++;

  return next();
}
