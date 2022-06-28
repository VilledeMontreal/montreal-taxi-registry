// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { getTimeSlot, getTimeUntilTimeSlotIsOver } from './timeSlot';

export async function timeSlotTests(): Promise<void> {
  it('getHailDataDumpTimeSlot unit tests', async () => {
    assert.strictEqual(getTimeSlot('2017-09-26T17:20:00.000Z', 60).startsAt, '2017-09-26T17:20:00.000Z');
    assert.strictEqual(getTimeSlot('2017-09-26T17:20:00.001Z', 60).startsAt, '2017-09-26T17:20:00.000Z');
    assert.strictEqual(getTimeSlot('2017-09-26T17:20:59.999Z', 60).startsAt, '2017-09-26T17:20:00.000Z');
    assert.strictEqual(getTimeSlot('2017-09-26T17:21:00.000Z', 60).startsAt, '2017-09-26T17:21:00.000Z');
  });

  it('getWaitingPeriodForCurrentTimeSlotToEnd unit tests', async () => {
    const timeSlot = getTimeSlot('2017-09-26T17:20:00.000Z', 60);

    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:19:59.999Z', timeSlot), 60 * 1000 + 1);
    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:20:00.000Z', timeSlot), 60 * 1000);
    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:20:00.001Z', timeSlot), 60 * 1000 - 1);
    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:20:59.999Z', timeSlot), 1);
    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:21:00.000Z', timeSlot), 0);
    assert.strictEqual(getTimeUntilTimeSlotIsOver('2017-09-26T17:21:00.001Z', timeSlot), 0);
  });
}
