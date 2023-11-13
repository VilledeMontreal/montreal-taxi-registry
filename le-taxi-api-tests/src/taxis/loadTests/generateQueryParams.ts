// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { generateLatForLoadTest, generateLonForLoadTest } from '../../shared/commonLoadTests/specialRegion';
import { IMotorSharedState } from './IMotorSharedState';

// tslint:disable-next-line: no-console
console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

const sharedStateJson = require('fs').readFileSync('src/taxis/loadTests/motor.sharedState.json');

export const sharedState: IMotorSharedState = JSON.parse(sharedStateJson);

export function generateRealtimeBookingQueryParams(context: any, ee: any, next: any) {
  return generateQueryParams(context, ee, next);
}

export function generateRealtimeBookingQueryParamsNoDestination(context: any, ee: any, next: any) {
  return generateQueryParams(context, ee, next, false);
}

function generateQueryParams(context: any, ee: any, next: any, withDestination: boolean = true) {
  context.vars.apikey = sharedState.searchMotor.apiKey;
  context.vars.pickup_lat = generateLatForLoadTest();
  context.vars.pickup_lon = generateLonForLoadTest();
  context.vars.drop_off_lat = withDestination ? generateLatForLoadTest() : null;
  context.vars.drop_off_lon = withDestination ? generateLonForLoadTest() : null;
  return next();
}
