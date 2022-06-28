// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { BadRequestError } from '../errorHandling/errors';
import { validateDate } from '../shared/dataDumps/dataDumps.validators';
import { addSec } from '../shared/dateUtils/dateUtils';

const intervalMinute = 10;

interface IDateRange {
  startDate: string;
  endDate: string;
}

function validateInterval(date: string): string {
  const asDate = new Date(date);
  if (!(Number.isInteger(asDate.getMinutes() / intervalMinute) && asDate.getSeconds() === 0)) {
    throw new BadRequestError(
      `Invalid date. Must be set to a ${intervalMinute} minutes intervale. Ex 2017-01-01T12:${intervalMinute}:00Z`
    );
  }
  return date;
}

function validateSnapshotRange(request: Request): IDateRange {
  const lastDate = validateInterval(validateDate(request));
  return {
    endDate: lastDate,
    startDate: addSec(lastDate, -intervalMinute * 60)
  };
}

export { validateSnapshotRange };
