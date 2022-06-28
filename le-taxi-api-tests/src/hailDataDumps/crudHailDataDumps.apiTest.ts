// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// tslint:disable: max-func-body-length
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { StatusHail } from '../hails/hail.enum';
import {
  motorUpdatesHailStatus,
  operatorGetHail,
  operatorUpdatesHailStatus,
  setupNewHailReceivedByTaxi,
  untilNextHailTimeSlotStarts
} from '../hails/hail.fixture';
import { copyHailTemplate } from '../hails/hailDto.template';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { untilTimeSlotIsOver } from '../shared/dataDumps/timeSlot';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getHailDataDumps } from './hailDataDumps.apiClient';

export async function crudHailDataDumpsTests(): Promise<void> {
  testGetDataDumpUserAccessValid(UserRole.Admin);
  testGetDataDumpUserAccessValid(UserRole.Manager);
  testGetDataDumpUserAccessValid(UserRole.Stats);

  it('Hail data dump: timeout taxi', async () => {
    const timeSlot = await untilNextHailTimeSlotStarts();
    const hail = await hailtoStatusTimeoutTaxi();
    await untilTimeSlotIsOver(timeSlot);

    const dataDump = await getHailDataDumps(timeSlot.startsAt);

    const hails: any[] = ([] = dataDump.body.data[0].items);
    const hailCreated = hails.find(element => element.id === hail.body.data[0].id);
    assert.strictEqual(dataDump.status, StatusCodes.OK);
    assert.strictEqual(hailCreated.id, hail.body.data[0].id);
    assert.strictEqual(hailCreated.taxi_id, hail.body.data[0].taxi.id);
    assert.isNotEmpty(hailCreated.read_only_after);
    assert.strictEqual(hailCreated.incident_taxi_reason, hail.body.data[0].incident_taxi_reason);
    assert.isNotNull(hailCreated.search_engine_id);
    checkHistoricStatusForDataDumpTimeOutTaxi(hailCreated.status_history);
  });

  it('Hail data dump: incident customer', async () => {
    const timeSlot = await untilNextHailTimeSlotStarts();
    const hail = await hailtoStatusIncidentCustomer();
    await untilTimeSlotIsOver(timeSlot);

    const dataDump = await getHailDataDumps(timeSlot.startsAt);

    const hails: any[] = ([] = dataDump.body.data[0].items);
    const hailCreated = hails.find(element => element.id === hail.body.data[0].id);
    assert.strictEqual(dataDump.status, StatusCodes.OK);
    assert.strictEqual(hailCreated.id, hail.body.data[0].id);
    assert.strictEqual(hailCreated.taxi_id, hail.body.data[0].taxi.id);
    assert.isNotEmpty(hailCreated.read_only_after);
    assert.strictEqual(hailCreated.incident_taxi_reason, hail.body.data[0].incident_taxi_reason);
    assert.isNotNull(hailCreated.search_engine_id);
    checkHistoricStatusForDataDumpIncidentCustomer(hailCreated.status_history);
  });

  function testGetDataDumpUserAccessValid(role: UserRole) {
    it(`User with role ${UserRole[role]} should be able to access hail data dumps`, async () => {
      const apiKey = await getImmutableUserApiKey(role);
      const dataDump = await getHailDataDumps('2020-07-01T00:00:00.000Z', apiKey);
      assert.strictEqual(dataDump.status, StatusCodes.OK);
    });
  }

  async function hailtoStatusTimeoutTaxi() {
    const dtoCreate = copyHailTemplate();
    const hailId = await setupNewHailReceivedByTaxi(dtoCreate);

    await aFewSeconds(configs.hails.exceedAnyHailStatusTimeoutInSec);

    return await operatorGetHail(hailId);
  }

  async function hailtoStatusIncidentCustomer() {
    const dtoCreate = copyHailTemplate();
    const hailId = await setupNewHailReceivedByTaxi(dtoCreate);

    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await motorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await motorUpdatesHailStatus(hailId, StatusHail.INCIDENT_CUSTOMER);
    return await operatorGetHail(hailId);
  }

  function checkHistoricStatusForDataDumpTimeOutTaxi(dataDumps: any[]) {
    assert.include(dataDumps[0].status, StatusHail.SENT_TO_OPERATOR);
    assert.include(dataDumps[1].status, StatusHail.RECEIVED_BY_OPERATOR);
    assert.include(dataDumps[2].status, StatusHail.RECEIVED_BY_TAXI);
    assert.include(dataDumps[3].status, StatusHail.TIMEOUT_TAXI);
  }

  function checkHistoricStatusForDataDumpIncidentCustomer(dataDumps: any[]) {
    assert.include(dataDumps[0].status, StatusHail.SENT_TO_OPERATOR);
    assert.include(dataDumps[1].status, StatusHail.RECEIVED_BY_OPERATOR);
    assert.include(dataDumps[2].status, StatusHail.RECEIVED_BY_TAXI);
    assert.include(dataDumps[3].status, StatusHail.ACCEPTED_BY_TAXI);
    assert.include(dataDumps[4].status, StatusHail.ACCEPTED_BY_CUSTOMER);
    assert.include(dataDumps[5].status, StatusHail.INCIDENT_CUSTOMER);
  }
}
