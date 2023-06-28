// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { shouldThrow } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { createUser, login, updateApikey, updatePassword, updateUser } from './user.apiClient';
import { getImmutableUserApiKey } from './user.sharedFixture';
import { copyUserTemplate } from './userDto.template';

// tslint:disable:max-func-body-length
export async function invalidUserTests(): Promise<void> {
  testCreateAccountUserAccessInvalid(UserRole.Operator);
  testCreateAccountUserAccessInvalid(UserRole.Prefecture);
  testCreateAccountUserAccessInvalid(UserRole.Motor);
  testCreateAccountUserAccessInvalid(UserRole.Stats);
  testCreateAccountUserAccessInvalid(UserRole.Inspector);

  testChangeApikeyAccessInvalid(UserRole.Operator);
  testChangeApikeyAccessInvalid(UserRole.Prefecture);
  testChangeApikeyAccessInvalid(UserRole.Motor);
  testChangeApikeyAccessInvalid(UserRole.Stats);
  testChangeApikeyAccessInvalid(UserRole.Inspector);

  testChangePasswordAccessInvalid(UserRole.Operator);
  testChangePasswordAccessInvalid(UserRole.Prefecture);
  testChangePasswordAccessInvalid(UserRole.Motor);
  testChangePasswordAccessInvalid(UserRole.Stats);
  testChangePasswordAccessInvalid(UserRole.Inspector);

  it('Should return Unauthorized', async () => {
    await shouldThrow(
      () =>
        login({
          login: 'xxxxxxxx',
          password: 'yyyyyyy'
        }),
      err => {
        assert.strictEqual(err.status, StatusCodes.UNAUTHORIZED);
      }
    );
  });

  it('Should return Bad Request when creating operator without a public_id', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.public_id = null;
    });

    await shouldThrow(
      () => createUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'Operators must be provided with a public_id');
      }
    );
  });

  it('Should return Bad Request when creating operator with duplicate public_id', async () => {
    const guid = uuidv4();
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.public_id = guid;
    });
    await createUser(userDto);

    const otherUserDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.public_id = guid;
    });
    await shouldThrow(
      () => createUser(otherUserDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'Operator public_id must be unique');
      }
    );
  });

  it('Should return Bad Request when updating operator without a public_id', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.public_id = null;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'Operators must be provided with a public_id');
      }
    );
  });

  it('Should return Bad Request when creating operator with a public_id that is not a GUID', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.public_id = 'XXXX';
    });

    await shouldThrow(
      () => createUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'The object failed the validation because public_id must be a UUID'
        );
      }
    );
  });

  it('Should return Bad Request when creating operator without a website_url', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.website_url = null;
    });

    await shouldThrow(
      () => createUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'Operators must be provided with a website_url');
      }
    );
  });

  it('Should return Bad Request when updating operator without a website_url', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.website_url = null;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(err.response.body.error.message, 'Operators must be provided with a website_url');
      }
    );
  });

  it('Should return Bad Request when creating operator with a website_url that is not a valid url', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.website_url = 'XXXX';
    });

    await shouldThrow(
      () => createUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'The object failed the validation because website_url must be an URL address'
        );
      }
    );
  });

  it('Should return Bad Request when promoting standard booking taxi with missing information', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_is_promoted_to_public = true;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'In order to promote publicly standard taxis, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
        );
      }
    );
  });

  it('Should return Bad Request when promoting minivan booking with missing information', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_website_url = 'http://test.ca';
    userDto.standard_booking_is_promoted_to_public = true;
    userDto.minivan_booking_is_promoted_to_public = true;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'In order to promote publicly standard minivans, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
        );
      }
    );
  });

  it('Should return Bad Request when promoting minivan booking but not standard booking', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_is_promoted_to_public = false;
    userDto.minivan_booking_is_promoted_to_public = true;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'In order to promote publicly minivans, standard booking must be available'
        );
      }
    );
  });

  it('Should return Bad Request when promoting special need booking with missing information', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.special_need_booking_is_promoted_to_public = true;

    await shouldThrow(
      () => updateUser(userDto),
      err => {
        assert.strictEqual(err.status, StatusCodes.BAD_REQUEST);
        assert.strictEqual(
          err.response.body.error.message,
          'In order to promote publicly special need taxis, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
        );
      }
    );
  });
}

function testCreateAccountUserAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to create an Account `, async () => {
    const dtoCreate = copyUserTemplate();
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () => createUser(dtoCreate, apiKey),
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

function testChangeApikeyAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to change an Apikey `, async () => {
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const user = await createUser(dtoCreate);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () =>
        updateApikey(x => {
          x.id = user.id;
        }, apiKey),
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

function testChangePasswordAccessInvalid(role: UserRole) {
  it(`User with role ${UserRole[role]} should not be able to change a Password `, async () => {
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const user = await createUser(dtoCreate);
    const apiKey = await getImmutableUserApiKey(role);
    await shouldThrow(
      () =>
        updatePassword(x => {
          x.id = user.id;
        }, apiKey),
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
