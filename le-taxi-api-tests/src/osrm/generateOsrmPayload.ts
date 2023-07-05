// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getRandomNumberBetween } from '../shared/commonLoadTests/randomData';
import { generateLatForApiTest, generateLonForApiTest } from '../shared/commonLoadTests/specialRegion';

// tslint:disable-next-line: no-console
console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

export function beforeGetRoute(context: any, ee: any, next: any) {
  context.vars.taxiLat = generateLatForApiTest();
  context.vars.taxiLon = generateLonForApiTest();
  context.vars.clientLat = addOffset(context.vars.taxiLat);
  context.vars.clientLon = addOffset(context.vars.taxiLon);
  context.vars.destinationLat = generateLatForApiTest();
  context.vars.destinationLon = generateLonForApiTest();
  return next();
}

function addOffset(value: number) {
  const offset = getRandomNumberBetween(-0.015, 0.015);

  return value + offset;
}
