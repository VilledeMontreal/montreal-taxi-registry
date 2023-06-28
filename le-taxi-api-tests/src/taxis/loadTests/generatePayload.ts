// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { generateSouthShoreLat, generateSouthShoreLon } from '../../shared/commonLoadTests/specialRegion';
import { IMotorSharedState } from './IMotorSharedState';

// tslint:disable-next-line: no-console
console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

const sharedStateJson = require('fs').readFileSync('src/taxis/loadTests/motor.sharedState.json');

export const sharedState: IMotorSharedState = JSON.parse(sharedStateJson);

export function generateWaitTimePayload(context: any, ee: any, next: any) {
  return generatePayload(context, ee, next);
}

export function generateWaitTimePayloadNoDestination(context: any, ee: any, next: any) {
  return generatePayload(context, ee, next, false);
}

function generatePayload(context: any, ee: any, next: any, withDestination: boolean = true) {
  context.vars.apikey = sharedState.searchMotor.apiKey;
  context.vars.body = {
    pickup_lat: generateSouthShoreLat(),
    pickup_lon: generateSouthShoreLon(),
    drop_off_lat: withDestination ? generateSouthShoreLat() : null,
    drop_off_lon: withDestination ? generateSouthShoreLon() : null,
    brand_id: ['taxi-registry-standard', 'taxi-registry-minivan', 'taxi-registry-special-need']
  };
  return next();
}
