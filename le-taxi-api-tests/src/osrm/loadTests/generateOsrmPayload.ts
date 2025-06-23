// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { getRandomNumberBetween } from "../../shared/commonLoadTests/randomData";
import { generatePointForLoadTest } from "../../shared/commonLoadTests/specialRegion";

// eslint-disable-next-line no-console
console.log(
  "WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!"
);

export function beforeGetRoute(context: any, ee: any, next: any) {
  const source = generatePointForLoadTest();
  const dest = generatePointForLoadTest();
  context.vars.taxiLat = source.lat;
  context.vars.taxiLon = source.lon;
  context.vars.clientLat = addOffset(source.lat);
  context.vars.clientLon = addOffset(source.lon);
  context.vars.destinationLat = dest.lat;
  context.vars.destinationLon = dest.lon;
  return next();
}

function addOffset(value: number) {
  const offset = getRandomNumberBetween(-0.015, 0.015);
  return value + offset;
}
