// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { BadRequestError } from '../errorHandling/errors';
import { hailConfig, hailDataDumpPeriodMilliseconds } from '../hails/hailConfig';
import { isUtcIsoString, nowUtcIsoString } from '../shared/dateUtils/dateUtils';

const hailsEpoch = '2020-07-01T00:00:00.000Z';

export function validateTimeSlot(request: Request): string {
  const timeSlot = request.params.timeSlot;
  if (!timeSlot) {
    throw new BadRequestError('The query string timeSlot is required.');
  }
  if (!isUtcIsoString(timeSlot)) {
    throw new BadRequestError('The expected date format is: AAAA-MM-JJThh:mm:ss.nnnZ.');
  }
  if (
    new Date(timeSlot).getMinutes() % hailConfig.dataDump.dumpPeriodInMinutes !== 0 ||
    new Date(timeSlot).getSeconds() !== 0 ||
    new Date(timeSlot).getMilliseconds() !== 0
  ) {
    throw new BadRequestError(
      `The start date (${timeSlot}) does not match the data dumb period. From ${hailsEpoch}, hails data dumps are available at each ${hailConfig.dataDump.dumpPeriodInMinutes} minutes.`
    );
  }
  if (timeSlot < hailsEpoch) {
    throw new BadRequestError(`There are no hails prior to ${hailsEpoch}`);
  }
  if (isTimeSlotOutOfRange(timeSlot)) {
    throw new BadRequestError(`This timeslot is not over yet.`);
  }
  return timeSlot;
}

function isTimeSlotOutOfRange(dateStart: string): boolean {
  // precondition: dateStart is a multiple of hailConfig.dataDump.dumpPeriodInMinutes
  const now = new Date(nowUtcIsoString());
  const endOfLatestCompletedTimeSlotUpperBound = new Date(now.getTime() - hailDataDumpPeriodMilliseconds);
  return dateStart >= endOfLatestCompletedTimeSlotUpperBound.toISOString();
}
