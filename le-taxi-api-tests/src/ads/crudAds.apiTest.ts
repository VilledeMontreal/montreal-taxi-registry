// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../shared/commonTests/UserRole';
import { createNonImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { generateAutoNumeroAds, postAds } from './ads.apiClient';
import {
  copyAdsOwnerTemplate,
  copyAdsPermitTemplate,
  inseeWithOwnerSemanticForADS,
  inseeWithPermitSemanticForADS
} from './adsDto.template';

// tslint:disable-next-line: max-func-body-length
export async function crudAdsTests(): Promise<void> {
  testCreateAdsUserAccessValid(UserRole.Admin);
  testCreateAdsUserAccessValid(UserRole.Operator);

  it('Can create a ADS directly from template', async () => {
    const adsDto = copyAdsOwnerTemplate();
    const responseAds = await postAds(adsDto);
    assert.strictEqual(responseAds.status, StatusCodes.CREATED);
  });

  it('Can Update Each ADS Attribute when "permit semantic" apply', async () => {
    const adsDto = copyAdsPermitTemplate();
    const responseCreated = await postAds(adsDto);

    const dtoAdsUpdate = copyAdsPermitTemplate(x => {
      const item = x.data[0];
      item.numero = responseCreated.body.data[0].numero;
      item.owner_name = 'OwnerNameUpdated';
      item.owner_type = 'individual';
      item.doublage = false;
      item.vdm_vignette = '5555';
    });

    const responseUpdate = await postAds(dtoAdsUpdate);

    assert.strictEqual(responseUpdate.status, StatusCodes.OK);
    const responseItem = responseUpdate.body.data[0];
    assert.strictEqual(responseItem.owner_name, 'OwnerNameUpdated');
    assert.strictEqual(responseItem.owner_type, 'individual');
    assert.strictEqual(responseItem.doublage, false);
    assert.strictEqual(responseItem.vdm_vignette, '5555');
  });

  it('Can Update (or derive) Each ADS Attribute', async () => {
    const adsDto = copyAdsOwnerTemplate();
    const responseCreated = await postAds(adsDto);

    const dtoAdsUpdate = copyAdsOwnerTemplate(x => {
      const item = x.data[0];
      item.numero = responseCreated.body.data[0].numero;
      item.owner_name = 'OwnerNameUpdated';
      item.owner_type = 'individual';
      item.doublage = false;
      item.vdm_vignette = 'to-be-override-by-numero';
    });

    const responseUpdate = await postAds(dtoAdsUpdate);

    assert.strictEqual(responseUpdate.status, StatusCodes.OK);
    const responseItem = responseUpdate.body.data[0];
    assert.strictEqual(responseItem.owner_name, 'OwnerNameUpdated');
    assert.strictEqual(responseItem.owner_type, 'individual');
    assert.strictEqual(responseItem.doublage, false);
    assert.strictEqual(responseItem.vdm_vignette, responseCreated.body.data[0].numero);
  });

  it('Cannot alter the ads of another operator', async () => {
    const operatorA = await getImmutableUserApiKey(UserRole.Operator);
    const operatorB = (await createNonImmutableUser(UserRole.Operator, false)).apikey;

    const sameDto = copyAdsOwnerTemplate(x => {
      x.data[0].insee = inseeWithOwnerSemanticForADS;
      x.data[0].numero = 'same';
    });

    const canCreateMine = await postAds(sameDto, operatorA);
    const canUpdateMine = await postAds(sameDto, operatorA);
    const cannotUpdateYours = await postAds(sameDto, operatorB);

    // Cannot automate the assert for updating with operator B,
    // but still perform the test case.
    // in doubt it can be check manually in postgre.
    await postAds(sameDto, operatorB);

    assert.strictEqual(canCreateMine.status, StatusCodes.CREATED);
    assert.strictEqual(canUpdateMine.status, StatusCodes.OK);
    // The api makes it difficult to assert that there are no side effects,
    // because there are no GET on ads. At least, we check that sending
    // the same dto with another operator perform a create instead of an update
    assert.strictEqual(cannotUpdateYours.status, StatusCodes.CREATED);
  });

  it('Create an ADS when optional attributes are missing', async () => {
    const dto = copyAdsOwnerTemplate();
    delete dto.data[0].doublage;
    delete dto.data[0].vehicle_id;

    const response = await postAds(dto);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it('Create an ADS when optional attributes are null', async () => {
    const dto = copyAdsOwnerTemplate();
    dto.data[0].doublage = null;
    dto.data[0].vehicle_id = null;

    const response = await postAds(dto);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it('Create an ADS ignoring vehicle_id', async () => {
    const dto = copyAdsOwnerTemplate();
    dto.data[0].vehicle_id = 0;

    const response = await postAds(dto);

    assert.strictEqual(response.status, StatusCodes.CREATED);
    assert.strictEqual(response.body.data[0].vehicle_id, null);
  });

  it('Create an ADS when optional attributes are empty', async () => {
    const dtoCreate = copyAdsOwnerTemplate();
    dtoCreate.data[0].owner_name = '';
    dtoCreate.data[0].category = '';
    const response = await postAds(dtoCreate);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it('Create duplicate ADS when zone are different', async () => {
    const sameNumeroAds = generateAutoNumeroAds();
    const sameDtoButZone1 = copyAdsPermitTemplate(x => {
      x.data[0].insee = inseeWithPermitSemanticForADS;
      x.data[0].numero = sameNumeroAds;
    });
    const sameDtoButZone2 = copyAdsOwnerTemplate(x => {
      x.data[0].insee = inseeWithOwnerSemanticForADS;
      x.data[0].numero = sameNumeroAds;
    });

    const canCreatePermit1ForZone1 = await postAds(sameDtoButZone1);
    const canCreatePermit1ForZone2 = await postAds(sameDtoButZone2);

    assert.strictEqual(canCreatePermit1ForZone1.status, StatusCodes.CREATED);
    assert.strictEqual(canCreatePermit1ForZone2.status, StatusCodes.CREATED);
  });
}

function testCreateAdsUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create an ADS `, async () => {
    const dtoCreate = copyAdsOwnerTemplate();
    const apiKey = await getImmutableUserApiKey(role);
    const response = await postAds(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}
