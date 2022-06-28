// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { configs, getAbsoluteUrl } from '../../config/configs';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { IHail } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { getHail } from './hail.apiClient';
import { StatusHail } from './hail.enum';
import { createOperatorForHail, setupNewHailId } from './hail.fixture';
import { copyHailTemplate } from './hailDto.template';

// tslint:disable-next-line:max-func-body-length
export async function hailOperatorTests(): Promise<void> {
  it(`Create Hail with taxi phone number`, async () => {
    const hail = await testNewHailWithFakeOperatorServer('fake-hail-with-phone');

    assert.strictEqual(hail.body.data[0].taxi_phone_number, '514 302-3022');
  });

  it(`The taxi phone number isn't mandatory to create a Hail`, async () => {
    const hail = await testNewHailWithFakeOperatorServer('fake-hail');

    assert.isNull(hail.body.data[0].taxi_phone_number);
  });

  it('Create a Hail when customer_address and customer_phone_number are empty', async () => {
    const hailDto = copyHailTemplate();
    hailDto.data[0].customer_address = '';
    hailDto.data[0].customer_phone_number = '';

    const hailCreated = await testNewHailWithFakeOperatorServer('fake-hail', hailDto);

    assert.strictEqual(hailCreated.body.data[0].customer_address, '');
    assert.strictEqual(hailCreated.body.data[0].customer_phone_number, '');
  });

  it('Should be an invalid Json and can create a Hail', async () => {
    await testNewHailWithFakeOperatorServer('fake-hail-invalid-json');
  });

  it('Create a hail wih data null from operator', async () => {
    await testNewHailWithFakeOperatorServer('fake-hail-null');
  });

  it('Create a Hail with wrong operator', async () => {
    const hailDto = copyHailTemplate();
    hailDto.data[0].operateur = 'Wrong';

    await testNewHailWithFakeOperatorServer('fake-hail', hailDto);
  });

  it('5.2.8  Test Operator failure by HTTP error 500', async () => {
    const fakeHailEndpoint = getAbsoluteUrl(`/api/fakes/fake-hail-error`);
    const userOperator = await createOperatorForHail(fakeHailEndpoint);
    const hailId = await setupNewHailId(null, userOperator.apikey);
    await aFewSeconds(configs.hails.exceedAnyHailStatusTimeoutInSec);

    const hail = await getHail(hailId, userOperator.apikey);
    assert.strictEqual(hail.body.data[0].status, StatusHail.FAILURE);
  });
}

async function testNewHailWithFakeOperatorServer(fakeId: string, hailDto?: IHail) {
  const fakeHailEndpoint = getAbsoluteUrl(`/api/fakes/${fakeId}`);
  const userOperator = await createOperatorForHail(fakeHailEndpoint);
  const hailId = await setupNewHailId(hailDto, userOperator.apikey);
  await aFewSeconds(configs.hails.delayToReachStatusReceived_by_operatorInSec);

  const hail = await getHail(hailId, userOperator.apikey);
  assert.strictEqual(
    hail.body.data[0].status,
    StatusHail.RECEIVED_BY_OPERATOR,
    'Hail created with fake operator server must be able to reach the status received_by_operator.'
  );

  return hail;
}
