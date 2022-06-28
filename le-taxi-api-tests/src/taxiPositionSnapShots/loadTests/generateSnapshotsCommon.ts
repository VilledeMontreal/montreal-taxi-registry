// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getRandomArrayItem } from '../../shared/commonLoadTests/randomData';
import { generateSouthShoreLat, generateSouthShoreLon } from '../../shared/commonLoadTests/specialRegion';
import { getCurrentUnixTime } from '../../shared/commonTests/testUtil';
import { copyTaxiPositionSnapShotItemTemplate } from '../taxiPositionSnapShotsDto.template';

const taxiSharedStateJson = require('fs').readFileSync('src/taxiPositionSnapShots/loadTests/taxi.sharedState.json');

export let _sharedStateForInitialization: any[] = null;
export let _sharedStateForTests: any[] = null;
let _currentOperatorIndex: number = 0;

export function beforeRequestForInitialization(requestParams: any, context: any, ee: any, next: any) {
  return beforeRequest(_sharedStateForInitialization, requestParams, context, ee, next);
}

export function beforeRequestForTests(requestParams: any, context: any, ee: any, next: any) {
  return beforeRequest(_sharedStateForTests, requestParams, context, ee, next);
}

function beforeRequest(sharedState: any[], requestParams: any, context: any, ee: any, next: any) {
  if (_currentOperatorIndex % sharedState.length === 0) {
    _currentOperatorIndex = 0;
  }
  const currentOperatorShareState = sharedState[_currentOperatorIndex];
  context.vars.operatorApikey = currentOperatorShareState.operator.apikey;
  requestParams.json = generateTaxiPositionSnapshotsPayload(currentOperatorShareState);
  _currentOperatorIndex++;
  return next();
}

function generateTaxiPositionSnapshotsPayload(currentOperatorShareState: any): any {
  const items = currentOperatorShareState.taxi.map((taxi: any) =>
    copyTaxiPositionSnapShotItemTemplate(taxiPositionSnapShotItem => {
      taxiPositionSnapShotItem.taxi = taxi.id;
      taxiPositionSnapShotItem.operator = currentOperatorShareState.operator.email;
      taxiPositionSnapShotItem.status = getRandomArrayItem(['free', 'occupied']);
      taxiPositionSnapShotItem.lat = generateSouthShoreLat();
      taxiPositionSnapShotItem.lon = generateSouthShoreLon();
      taxiPositionSnapShotItem.timestamp = getCurrentUnixTime();
    })
  );

  return {
    items
  };
}

export function initializeSnapshotsAndOperatorsApiKeys(maxOperatorCount: number) {
  const sharedState = JSON.parse(taxiSharedStateJson);
  const halfOperatorCount = maxOperatorCount / 2;
  _sharedStateForInitialization = sharedState.items.filter((element: any, index: any) => index < halfOperatorCount);
  _sharedStateForTests = sharedState.items.filter(
    (element: any, index: any) => index >= halfOperatorCount && index < maxOperatorCount
  );
}
