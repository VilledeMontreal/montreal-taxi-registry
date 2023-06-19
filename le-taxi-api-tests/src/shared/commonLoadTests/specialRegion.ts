// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ICoordinates } from '../coordinates/coordinates';
import { getRandomNumberBetween } from './randomData';

export function generateNorthShoreLat() {
  return getRandomNumberBetween(45.55, 45.6);
}

export function generateNorthShoreLon() {
  return getRandomNumberBetween(-73.95, -74);
}

export function generateSouthShoreLat(): number {
  return getRandomNumberBetween(45.350207, 45.40);
}

export function generateSouthShoreLon(): number {
  return getRandomNumberBetween(-73.40, -73.35);
}

export function generateSouthShoreCoordinates(): ICoordinates {
  return { lat: generateSouthShoreLat(), lon: generateSouthShoreLon() };
}

export function getAirportCoordinates(): ICoordinates {
  // Airport Montreal, 7 Roméo-Vachon Blvd N, Dorval, Quebec H4Y 1H1
  return { lat: 45.457659, lon: -73.7507184 };
}

export function getDowntownCoordinates(): ICoordinates {
  // 80 queen
  return { lat: 45.49714, lon: -73.55461 };
}
