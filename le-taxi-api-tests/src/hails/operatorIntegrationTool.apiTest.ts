// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../config/configs';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { postOperatorToolsHail, putOperatorToolsHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import { operatorUpdatesHailStatus, setPositionTaxi, setupNewTaxi } from './hail.fixture';
import { copyHailStatusTemplate, copyHailTemplate } from './hailDto.template';

// tslint:disable-next-line:max-func-body-length
export async function operatorIntegrationToolTests(): Promise<void> {
  it('Test hail happy path via the operator integration tools', async () => {
    const hailId = await setupNewHailIdOperatorTool();
    await aFewSeconds(configs.hails.delayToReachStatusReceived_by_operatorInSec);
    await operatorUpdatesHailStatus(hailId, StatusHail.RECEIVED_BY_TAXI);
    await operatorUpdatesHailStatus(hailId, StatusHail.ACCEPTED_BY_TAXI);
    await testOperatorToolsUpdateHailStatus(hailId, StatusHail.ACCEPTED_BY_CUSTOMER);
    await operatorUpdatesHailStatus(hailId, StatusHail.CUSTOMER_ON_BOARD);
    await operatorUpdatesHailStatus(hailId, StatusHail.FINISHED);
  });
}

export async function testOperatorToolsUpdateHailStatus(hailId: string, status: StatusHail) {
  const hailStatus = copyHailStatusTemplate(x => {
    x.data[0].status = status;
  });
  const responseUpdate = await putOperatorToolsHail(hailStatus, hailId);

  assert.strictEqual(responseUpdate.status, StatusCodes.OK);
  assert.strictEqual(responseUpdate.body.data[0].status, status);
}

async function setupNewHailIdOperatorTool() {
  const taxi = await setupNewTaxi();
  const taxiId = taxi.body.data[0].id;
  const taxiOperator = taxi.body.data[0].operator;
  await setPositionTaxi(taxiId, taxiOperator, 'free');

  const hailDto = copyHailTemplate();
  hailDto.data[0].taxi_id = taxiId;
  hailDto.data[0].operateur = taxiOperator;
  const responseHailPost = await postOperatorToolsHail(hailDto);
  return responseHailPost.body.data[0].id;
}
