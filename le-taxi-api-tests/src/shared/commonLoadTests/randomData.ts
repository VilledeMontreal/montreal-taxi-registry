// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function getRandomArrayItem<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function getRandomNumberBetween(min: number, max: number): number {
  const range = max - min;
  const offset = Math.random() * range;
  const randomBetweenMinAndMax = min + offset;
  return randomBetweenMinAndMax;
}
