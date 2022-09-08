// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';

import { UserRole } from '../shared/commonTests/UserRole';
import { createNonImmutableUser, getImmutableUserApiKey } from '../users/user.sharedFixture';
import { getProfessionalLicence, postDriver } from './driver.apiClient';
import { copyDriverTemplate } from './driverDto.template';

export async function crudDriverTests(): Promise<void> {
  testCreateDriverUserAccessValid(UserRole.Admin);
  testCreateDriverUserAccessValid(UserRole.Operator);

  it('Can create a driver directly from template', async () => {
    const dtoCreate = copyDriverTemplate();

    const response = await postDriver(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);
  });

  it('Can Update Each Driver Attribute', async () => {
    const dtoCreate = copyDriverTemplate(x => {
      x.data[0].first_name = 'initialName';
      x.data[0].last_name = 'initialLastName';
      x.data[0].departement.nom = 'Québec';
      x.data[0].departement.numero = '1000';
    });

    const responseCreate = await postDriver(dtoCreate);

    assert.strictEqual(responseCreate.body.data[0].first_name, 'initialName');
    assert.strictEqual(responseCreate.body.data[0].last_name, 'initialLastName');
    assert.strictEqual(responseCreate.body.data[0].departement.nom, 'Québec');
    assert.strictEqual(responseCreate.body.data[0].departement.numero, '1000');

    const dtoUpdate = copyDriverTemplate(x => {
      x.data[0].professional_licence = responseCreate.body.data[0].professional_licence;
      x.data[0].first_name = 'updatedFirstName';
      x.data[0].last_name = 'updatedLastName';
      x.data[0].departement.nom = responseCreate.body.data[0].departement.nom;
      x.data[0].departement.numero = responseCreate.body.data[0].departement.numero;
    });

    const responseUpdate = await postDriver(dtoUpdate);

    assert.strictEqual(responseUpdate.status, StatusCodes.OK);

    assert.strictEqual(responseUpdate.body.data[0].first_name, 'updatedFirstName');
    assert.strictEqual(responseUpdate.body.data[0].last_name, 'updatedLastName');
  });

  it('Cannot alter the driver of another operator', async () => {
    const operatorA = await getImmutableUserApiKey(UserRole.Operator);
    const operatorB = (await createNonImmutableUser(UserRole.Operator)).apikey;
    const sameDto = copyDriverTemplate(x => (x.data[0].professional_licence = 'same'));

    const canCreateMine = await postDriver(sameDto, operatorA);
    const canUpdateMine = await postDriver(sameDto, operatorA);
    const cannotUpdateYours = await postDriver(sameDto, operatorB);

    // Cannot automate the assert for updating with operator B,
    // but still perform the test case.
    // in doubt it can be check manually in postgre.
    await postDriver(sameDto, operatorB);

    assert.strictEqual(canCreateMine.status, StatusCodes.CREATED);
    assert.strictEqual(canUpdateMine.status, StatusCodes.OK);
    // The api makes it difficult to assert that there are no side effects,
    // because there are no GET on driver. At least, we check that sending
    // the same dto with another operator perform a create instead of an update
    assert.strictEqual(cannotUpdateYours.status, StatusCodes.CREATED);
  });

  it('Should always set departement to Québec', async () => {
    const dtoCreate = copyDriverTemplate(x => {
      x.data[0].departement.numero = '1000';
      x.data[0].departement.nom = 'does not matter';
    });

    const response = await postDriver(dtoCreate);

    assert.strictEqual(response.status, StatusCodes.CREATED);

    assert.strictEqual(response.body.data[0].departement.numero, '1000');
    assert.strictEqual(response.body.data[0].departement.nom, 'Québec');
  });

  it('Cannot persist a driver birthdate', async () => {
    const dtoCreate = copyDriverTemplate(x => (x.data[0].birth_date = new Date('2007-07-07')));

    const createResponse = await postDriver(dtoCreate);

    assert.strictEqual(createResponse.status, StatusCodes.CREATED);
    assert.isNull(createResponse.body.data[0].birth_date, 'cannot persist birthdate on create');

    const updateResponse = await postDriver(dtoCreate);
    assert.strictEqual(updateResponse.status, StatusCodes.OK);
    assert.isNull(updateResponse.body.data[0].birth_date, 'cannot persist birthdate on create');
  });

  it('Should allow operator to create same driver license for different departement', async () => {
    const professionalLicence = getProfessionalLicence();

    const dtoDriverMtl = copyDriverTemplate(x => {
      x.data[0].departement.numero = '660';
      x.data[0].professional_licence = professionalLicence;
    });

    const dtoDriverSaaq = copyDriverTemplate(x => {
      x.data[0].departement.numero = '1000';
      x.data[0].professional_licence = professionalLicence;
    });

    const responseMtl = await postDriver(dtoDriverMtl);
    const responseSaaq = await postDriver(dtoDriverSaaq);

    assert.strictEqual(responseMtl.status, StatusCodes.CREATED);
    assert.strictEqual(responseMtl.body.data[0].departement.numero, '660');

    assert.strictEqual(responseSaaq.status, StatusCodes.CREATED);
    assert.strictEqual(responseSaaq.body.data[0].departement.numero, '1000');
  });
}

function testCreateDriverUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create a driver`, async () => {
    const dtoCreate = copyDriverTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    const response = await postDriver(dtoCreate, apiKey);
    assert.strictEqual(response.status, StatusCodes.CREATED);
  });
}
