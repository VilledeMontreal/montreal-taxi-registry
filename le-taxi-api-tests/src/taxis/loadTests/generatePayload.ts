// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { generateSouthShoreLat, generateSouthShoreLon } from '../../shared/commonLoadTests/specialRegion';
import { IMotorSharedState } from './IMotorSharedState';

// tslint:disable-next-line: no-console
console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

const sharedStateJson = require('fs').readFileSync('src/taxis/loadTests/motor.sharedState.json');

export const sharedState: IMotorSharedState = JSON.parse(sharedStateJson);

export function generateStandardPayloadWaitTime(context: any, ee: any, next: any) {
  return generatePayloadWaitTime(context, ee, next, 'taxi-registry-standard');
}

export function generateSpecialNeedPayloadWaiTime(context: any, ee: any, next: any) {
  return generatePayloadWaitTime(context, ee, next, 'taxi-registry-special-need');
}

function generatePayloadWaitTime(context: any, ee: any, next: any, assetType: string) {
  context.vars.apikey = sharedState.searchMotor.apiKey;
  context.vars.body = {
    pickup_lat: generateSouthShoreLat(),
    pickup_lon: generateSouthShoreLon(),
    drop_off_lat: generateSouthShoreLat(),
    drop_off_lon: generateSouthShoreLon(),
    brand_id: [assetType]
  };
  return next();
}
