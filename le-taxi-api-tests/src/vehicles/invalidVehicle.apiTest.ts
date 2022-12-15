// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getImmutableUserApiKey } from '../users/user.sharedFixture';
import { setAllFlags } from './crudVehicle.apiTest';
import { postVehicle } from './vehicle.apiClient';
import { copyVehicleTemplate } from './vehiclesDto.template';

// tslint:disable-next-line: max-func-body-length
export async function invalidVehicleTests(): Promise<void> {
  testCreateVehicleUserAccessInvalid(UserRole.Motor);
  testCreateVehicleUserAccessInvalid(UserRole.Inspector);
  testCreateVehicleUserAccessInvalid(UserRole.Manager);
  testCreateVehicleUserAccessInvalid(UserRole.Stats);
  testCreateVehicleUserAccessInvalid(UserRole.Prefecture);

  it('Should be an error 400 Empty Array', async () => {
    const dtoCreate: any = [];

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'The array should not be empty');
      }
    );
  });

  it('Should return error when data length is more than one', async () => {
    const dtoCreate = copyVehicleTemplate();

    const dto2 = copyVehicleTemplate(x => {
      x.data[0].taximetre = 'Second Array';
    });
    dtoCreate.data.push(dto2.data[0]);

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'The array reached its limit of 1 items');
      }
    );
  });

  it('Should be error with wrong type_', async () => {
    const dtoCreate = copyVehicleTemplate(x => {
      x.data[0].type_ = 'green';
    });

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
      }
    );
  });

  it('Should be error with wrong date_dernier_ct format', async () => {
    const dtoCreate = copyVehicleTemplate(x => {
      x.data[0].date_dernier_ct = '20-12-25';
    });

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'date_dernier_ct must match');
      }
    );
  });

  it('Should be error with wrong date_validite_ct format', async () => {
    const dtoCreate = copyVehicleTemplate(x => {
      x.data[0].date_validite_ct = '19-12-25';
    });

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'date_validite_ct must match');
      }
    );
  });

  it('Should be error with missing licence plate', async () => {
    const dtoCreate = copyVehicleTemplate();
    delete dtoCreate.data[0].licence_plate;

    await shouldThrow(
      () => postVehicle(dtoCreate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.include(err.response.body.error.message, 'licence_plate should not be null or undefined');
      }
    );
  });

  it('Should return a error if constructor is a empty string', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].constructor = '';

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because constructor must be longer than or equal to 1 characters`
        );
      }
    );
  });

  it('Should return a error if constructor is null or undefined', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].constructor = null;

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because constructor should not be null or undefined`
        );
      }
    );
  });

  it('Should return a error if model is a empty string', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].model = '';

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because model must be longer than or equal to 1 characters`
        );
      }
    );
  });

  it('Should return a error if model is null or undefined', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].model = null;

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because model should not be null or undefined`
        );
      }
    );
  });

  it('Should return a error when model is missing on vehicle update', async () => {
    const dtoCreate = copyVehicleTemplate();
    const responseCreate = await postVehicle(dtoCreate);
    const dtoUpdate = copyVehicleTemplate(x => {
      const item = x.data[0];
      item.licence_plate = responseCreate.body.data[0].licence_plate;
      item.date_dernier_ct = '2017-10-21';
      item.date_validite_ct = '2020-12-22';
      item.horse_power = 10.1;
      item.model_year = 2019;
      item.type_ = 'mpv';
      item.nb_seats = 3;
      setAllFlags(x, true);
      item.horodateur = 'horodateur-updated';
      item.color = 'color-updated';
      item.taximetre = 'taximetre-updated';
      item.engine = 'engine-updated';
      item.constructor = 'constructor-updated';
      item.model = 'model-updated';
    });
    delete dtoUpdate.data[0].model;

    await shouldThrow(
      () => postVehicle(dtoUpdate),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because model should not be null or undefined`
        );
      }
    );
  });

  it('Should return a error if constructor is "legacy-not-provided"', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].constructor = 'legacy-not-provided';

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          `The object failed the validation because constructor should not contain a legacy-not-provided string`
        );
      }
    );
  });

  it('Should return a error if model is "legacy-not-provided"', async () => {
    const createdDto = copyVehicleTemplate();
    createdDto.data[0].model = 'legacy-not-provided';

    await shouldThrow(
      () => postVehicle(createdDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'The object failed the validation because model should not contain a legacy-not-provided string'
        );
      }
    );
  });
}

function testCreateVehicleUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create a vehicle `, async () => {
    const dtoCreate = copyVehicleTemplate();
    const apiKey = await getImmutableUserApiKey(role);

    await shouldThrow(
      () => postVehicle(dtoCreate, apiKey),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
        assert.strictEqual(
          err.response.body.error.message,
          'The user has a role which has insufficient permissions to access this resource.'
        );
      }
    );
  });
}
