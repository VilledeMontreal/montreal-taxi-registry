// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function convertStringToBoolean(value: string) {
  if (!value) {
    return false;
  }
  return value.toLocaleLowerCase() === 'true';
}
