// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { aFewMilliseconds } from '../commonTests/testUtil';
const moment = require('moment');

interface IDataDumpTimeSlot {
  startsAt: string;
  timeSlotPeriodInSec: number;
}

export type UntilNextTimeSlotStarts = () => Promise<IDataDumpTimeSlot>;

export function defineUntilNextTimeSlotStarts(timeSlotPeriodInSec: number): UntilNextTimeSlotStarts {
  return async () => {
    const utcNow = new Date().toISOString();
    const currentTimeSlot = getTimeSlot(utcNow, timeSlotPeriodInSec);
    const nextTimeSlot = getNextTimeSlot(currentTimeSlot);
    await untilTimeSlotIsOver(currentTimeSlot);
    return nextTimeSlot;
  };
}

export async function untilTimeSlotIsOver(timeSlot: IDataDumpTimeSlot) {
  const utcNow = new Date().toISOString();
  const timeUntilTimeSlotIsOver = getTimeUntilTimeSlotIsOver(utcNow, timeSlot);
  const slack = 1000; // In order to avoid timing issues
  await aFewMilliseconds(timeUntilTimeSlotIsOver + slack);
}

export function getTimeSlot(dateIsoString: string, timeSlotPeriodInSec: number): IDataDumpTimeSlot {
  const date = new Date(dateIsoString);
  const dataDumpPeriodInMs = timeSlotPeriodInSec * 1000;
  const timeSlotStartTime = Math.floor(date.getTime() / dataDumpPeriodInMs) * dataDumpPeriodInMs;
  return {
    startsAt: new Date(timeSlotStartTime).toISOString(),
    timeSlotPeriodInSec
  };
}

export function getNextTimeSlot(timeSlot: IDataDumpTimeSlot) {
  const aDateInNextTimeSlot = moment
    .utc(timeSlot.startsAt)
    .add(timeSlot.timeSlotPeriodInSec, 'seconds')
    .toISOString();
  return getTimeSlot(aDateInNextTimeSlot, timeSlot.timeSlotPeriodInSec);
}

export function getTimeUntilTimeSlotIsOver(utcNow: string, currentTimeSlot: IDataDumpTimeSlot) {
  const nextTimeSlot = getNextTimeSlot(currentTimeSlot);
  if (utcNow >= nextTimeSlot.startsAt) {
    return 0;
  }

  return new Date(nextTimeSlot.startsAt).getTime() - new Date(utcNow).getTime();
}
