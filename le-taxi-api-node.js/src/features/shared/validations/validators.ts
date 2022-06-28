// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { plainToClassFromExist } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import * as _ from 'lodash';
import { BadRequestError, MultipleIssuesError } from '../../errorHandling/errors';
import { Coordinates } from '../../inquiry/inquiry.dto';
import { ICoordinates } from '../coordinates/coordinates';

export function validateCoordinates(coordinate: Coordinates): ICoordinates {
  if (!isLatitudeValid(coordinate.lat) || !isLongitudeValid(coordinate.lon)) {
    throw new BadRequestError(`The latitude or longitude values are not valid`);
  }

  return { lat: +coordinate.lat, lon: +coordinate.lon };
}

// Values specified in https://docs.mongodb.com/manual/geospatial-queries/
export function isLatitudeValid(lat: number): boolean {
  return isNumber(lat) && lat >= -90 && lat <= 90;
}

// Values specified in https://docs.mongodb.com/manual/geospatial-queries/
export function isLongitudeValid(lon: number): boolean {
  return isNumber(lon) && lon >= -180 && lon <= 180;
}

export function isNumber(n: any): boolean {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function validateArrayNotEmpty<T>(array: T[]): void {
  if (!_.isArray(array) || _.isEmpty(array)) {
    throw new BadRequestError(`The array should not be empty`);
  }
}

export function validateArrayLimit<T>(array: T[], limit: number): void {
  if (array.length > limit) {
    throw new BadRequestError(`The array reached its limit of ${limit} items`);
  }
}

export function validateIsPropertyNull4ReservedField<T>(array: T[], property = 'constructor'): void {
  if (!array[0][property]) {
    throw new BadRequestError(`The object failed the validation because ${property} should not be null or undefined`);
  }
}

export function validateUndefined(dto: any, message: string) {
  if (_.isNil(dto)) {
    throw new BadRequestError(`${message}`);
  }
}

export async function validateDtoProperties<T extends Object>(dto: T, data: any) {
  const instance = plainToClassFromExist(dto, data);
  await handleErrors(() => validateOrReject(instance, { skipMissingProperties: true }));
}

async function handleErrors(func: () => void) {
  try {
    await func();
  } catch (err) {
    const validationErrors = err as ValidationError[];
    if (!validationErrors) {
      throw err;
    }
    const issues = extractErrors(validationErrors, []);
    if (issues.length === 1) {
      throw new BadRequestError(`The object failed the validation because ${issues[0]}`);
    }
    throw new MultipleIssuesError(
      'The object failed the validation because more than one of its property are invalid.',
      issues
    );
  }
}

function extractErrors(errors: ValidationError[], issues: string[], depth: number = 0) {
  if (!errors || errors.length === 0 || depth >= 10) return issues;

  const errToIssues = errors
    .filter(error => error.constraints)
    .map(error => {
      const constraints = error.constraints;
      const objectKeys = Object.keys(constraints);
      return constraints[objectKeys[0]];
    });

  return extractErrors(
    errors.flatMap(error => error.children),
    issues.concat(...errToIssues),
    ++depth
  );
}
