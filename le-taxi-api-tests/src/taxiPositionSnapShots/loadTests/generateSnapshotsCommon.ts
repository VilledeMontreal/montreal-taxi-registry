// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getRandomArrayItem } from '../../shared/commonLoadTests/randomData';
import { generateLatForLoadTest, generateLonForLoadTest } from '../../shared/commonLoadTests/specialRegion';
import { getCurrentUnixTime } from '../../shared/commonTests/testUtil';
import { copyTaxiPositionSnapShotItemTemplate } from '../taxiPositionSnapShotsDto.template';

// tslint:disable-next-line: no-console
console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

const taxiSharedStateJson = require('fs').readFileSync('src/taxiPositionSnapShots/loadTests/taxi.sharedState.json');

export let sharedStateForInitialization: any[] = null;
export let sharedStateForTests: any[] = null;
let currentOperatorIndex: number = 0;

export function beforeRequestForInitialization(requestParams: any, context: any, ee: any, next: any) {
  return beforeRequest(sharedStateForInitialization, requestParams, context, ee, next);
}

export function beforeRequestForTests(requestParams: any, context: any, ee: any, next: any) {
  return beforeRequest(sharedStateForTests, requestParams, context, ee, next);
}

function beforeRequest(sharedState: any[], requestParams: any, context: any, ee: any, next: any) {
  if (currentOperatorIndex % sharedState.length === 0) {
    currentOperatorIndex = 0;
  }
  const currentOperatorShareState = sharedState[currentOperatorIndex];
  context.vars.operatorApikey = currentOperatorShareState.operator.apikey;
  requestParams.json = generateTaxiPositionSnapshotsPayload(currentOperatorShareState);
  currentOperatorIndex++;
  return next();
}

function generateTaxiPositionSnapshotsPayload(currentOperatorShareState: any): any {
  const items = currentOperatorShareState.taxi.map((taxi: any) =>
    copyTaxiPositionSnapShotItemTemplate(taxiPositionSnapShotItem => {
      taxiPositionSnapShotItem.taxi = taxi.id;
      taxiPositionSnapShotItem.operator = currentOperatorShareState.operator.email;
      taxiPositionSnapShotItem.status = getRandomArrayItem(['free', 'occupied']);
      taxiPositionSnapShotItem.lat = generateLatForLoadTest();
      taxiPositionSnapShotItem.lon = generateLonForLoadTest();
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
  sharedStateForInitialization = sharedState.items.filter((element: any, index: any) => index < halfOperatorCount);
  sharedStateForTests = sharedState.items.filter(
    (element: any, index: any) => index >= halfOperatorCount && index < maxOperatorCount
  );
}
