// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ICoordinates } from '../coordinates/coordinates';
import { getRandomNumberBetween } from './randomData';

// Currently searching mongo with a maxDistance of 5000m, so the tests need to be within 5km to succeed
// 0.025 lat and 0.05 lon roughly gives a 4.8km max distance
export function generateNorthShoreLat() {
  return getRandomNumberBetween(45.575, 45.6);
}

export function generateNorthShoreLon() {
  return getRandomNumberBetween(-73.95, -74);
}

export function generateLatForApiTest(): number {
  return getRandomNumberBetween(45.375, 45.4);
}

export function generateLonForApiTest(): number {
  return getRandomNumberBetween(-73.4, -73.35);
}

export function generateApiTestCoordinates(): ICoordinates {
  return { lat: generateLatForApiTest(), lon: generateLonForApiTest() };
}

export function generateLatForLoadTest(): number {
  return getRandomNumberBetween(45.7, 46);
}

export function generateLonForLoadTest(): number {
  return getRandomNumberBetween(-74, -73.5);
}

export function getAirportCoordinates(): ICoordinates {
  // Airport Montreal, 7 Roméo-Vachon Blvd N, Dorval, Quebec H4Y 1H1
  return { lat: 45.457659, lon: -73.7507184 };
}

export function getDowntownCoordinates(): ICoordinates {
  // 80 queen
  return { lat: 45.49714, lon: -73.55461 };
}
