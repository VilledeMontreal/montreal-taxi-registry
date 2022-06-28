// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getRandomNumberBetween } from '../shared/commonLoadTests/randomData';
import { generateSouthShoreLat, generateSouthShoreLon } from '../shared/commonLoadTests/specialRegion';

export function beforeGetRoute(context: any, ee: any, next: any) {
  context.vars.taxiLat = generateSouthShoreLat();
  context.vars.taxiLon = generateSouthShoreLon();
  context.vars.clientLat = addOffset(context.vars.taxiLat);
  context.vars.clientLon = addOffset(context.vars.taxiLon);
  context.vars.destinationLat = generateSouthShoreLat();
  context.vars.destinationLon = generateSouthShoreLon();
  return next();
}

function addOffset(value: number) {
  const offset = getRandomNumberBetween(-0.015, 0.015);

  return value + offset;
}
