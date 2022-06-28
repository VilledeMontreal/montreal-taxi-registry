// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { postDriver } from './driver.apiClient';
import { copyDriverTemplate } from './driverDto.template';

// tslint:disable-next-line:max-func-body-length
export async function invalidDriverTests(): Promise<void> {
  testCreateDriverUserAccessInvalid(UserRole.Motor);
  testCreateDriverUserAccessInvalid(UserRole.Inspector);
  testCreateDriverUserAccessInvalid(UserRole.Manager);
  testCreateDriverUserAccessInvalid(UserRole.Stats);
  testCreateDriverUserAccessInvalid(UserRole.Prefecture);

  it('Should be an error 400 Empty Array', async () => {
    const dtoCreate: any = [];
    await shouldThrow(
      () => postDriver(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The array should not be empty');
      }
    );
  });

  it('Should return error when data length is more than one', async () => {
    const dto = copyDriverTemplate();

    const dto2 = copyDriverTemplate(x => {
      x.data[0].departement.nom = 'Second Array';
    });
    dto.data.push(dto2.data[0]);

    await shouldThrow(
      () => postDriver(dto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The array reached its limit of 1 items');
      }
    );
  });

  it('Should be an error 400 professional_licence <4', async () => {
    const dtoCreate = copyDriverTemplate(x => {
      x.data[0].professional_licence = '000';
    });

    await shouldThrow(
      () => postDriver(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because professional_licence must be longer than or equal to 4 characters'
        );
      }
    );
  });

  it('Should be an error 400 first_name null', async () => {
    const dtoCreate = copyDriverTemplate(x => {
      x.data[0].first_name = null;
    });

    await shouldThrow(
      () => postDriver(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because first_name should not be null or undefined'
        );
      }
    );
  });

  it('Should be error with wrong department number', async () => {
    const dto = copyDriverTemplate(x => {
      x.data[0].departement.numero = '0';
    });

    await shouldThrow(
      () => postDriver(dto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          `Department with number '0' was not found. Either make sure the department exists or use the default department number '1000' instead.`
        );
      }
    );
  });

  it('Should be an error 400 last_name null', async () => {
    const dtoCreate = copyDriverTemplate(x => {
      x.data[0].last_name = null;
    });

    await shouldThrow(
      () => postDriver(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because last_name should not be null or undefined'
        );
      }
    );
  });

  it('Should not be able to create a driver without a professional licence', async () => {
    const dtoCreate = copyDriverTemplate();
    delete dtoCreate.data[0].professional_licence;

    await shouldThrow(
      () => postDriver(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(
          err.response.body.error.message,
          'The object failed the validation because professional_licence should not be null or undefined'
        );
      }
    );
  });

  it('Should be an error 400 invalid object ', async () => {
    const driverString: any = { driver: 'driver' };

    await shouldThrow(
      () => postDriver(driverString),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'The array should not be empty');
      }
    );
  });
}

function testCreateDriverUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create a driver.`, async () => {
    const dtoCreate = copyDriverTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => postDriver(dtoCreate, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.include(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}
