// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { assert } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../shared/commonTests/UserRole';
import {
  createUser,
  getLoginUserinfo,
  getUser,
  login,
  updateApikey,
  updatePassword,
  updateUser
} from './user.apiClient';
import { getImmutableUserApiKey } from './user.sharedFixture';
import { copyUserTemplate } from './userDto.template';

// tslint:disable:max-func-body-length
export async function crudUserTests(): Promise<void> {
  testCreateAccountUserAccessValid(UserRole.Admin);
  testCreateAccountUserAccessValid(UserRole.Manager);

  testChangeApikeyAccessValid(UserRole.Admin);
  testChangeApikeyAccessValid(UserRole.Manager);

  testChangePasswordAccessValid(UserRole.Admin);
  testChangePasswordAccessValid(UserRole.Manager);

  it('Should return 200 on good credentials', async () => {
    const response = await login();
    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should be able to fetch userinfo after successful login', async () => {
    const responseLogin = await login();
    const arrayWithAccessTokenKeyValue = responseLogin
      .get('set-cookie')[0]
      .split(';')
      .map((x: string) => x.split('='))
      .filter((x: string[]) => x && x[0] === 'access_token');
    const accessTokenValue =
      arrayWithAccessTokenKeyValue && arrayWithAccessTokenKeyValue[0] && arrayWithAccessTokenKeyValue[0][1];
    const response = await getLoginUserinfo(accessTokenValue);

    assert.strictEqual(response.status, StatusCodes.OK);
  });

  it('Should not expose password nor apikey on getUser', async () => {
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const user = await createUser(dtoCreate);
    const responseUser = await getUser(user.id);
    assert.exists(responseUser.id);
    assert.notExists(responseUser.password);
    assert.notExists(responseUser.apikey);
  });

  it('Can promote an operator standard service given a standard website', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_website_url = 'http://test.ca';
    userDto.standard_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator standard service given a standard phone number', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_phone_number = '5145551234';
    userDto.standard_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator standard service given a standard android/ios deep links', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_android_deeplink_uri = 'http://test.ca';
    userDto.standard_booking_android_store_uri = 'http://test.ca';
    userDto.standard_booking_ios_deeplink_uri = 'http://test.ca';
    userDto.standard_booking_ios_store_uri = 'http://test.ca';
    userDto.standard_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator minivan service given a standard website', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_website_url = 'http://test.ca';
    userDto.standard_booking_is_promoted_to_public = true;
    userDto.minivan_booking_is_available_from_web_url = true;
    userDto.minivan_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator minivan service given a standard phone number', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_phone_number = '5145551234';
    userDto.standard_booking_is_promoted_to_public = true;
    userDto.minivan_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator minivan service given a standard android/ios deep links', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.standard_booking_android_deeplink_uri = 'http://test.ca';
    userDto.standard_booking_android_store_uri = 'http://test.ca';
    userDto.standard_booking_ios_deeplink_uri = 'http://test.ca';
    userDto.standard_booking_ios_store_uri = 'http://test.ca';
    userDto.standard_booking_is_promoted_to_public = true;
    userDto.minivan_booking_is_available_from_android_uri = true;
    userDto.minivan_booking_is_available_from_ios_uri = true;
    userDto.minivan_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator special need service given a special need website', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.special_need_booking_website_url = 'http://test.ca';
    userDto.special_need_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator special need service given a special need phone number', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.special_need_booking_phone_number = '5145551234';
    userDto.special_need_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });

  it('Can promote an operator special need service given a special need android/ios deep links', async () => {
    const userDto = copyUserTemplate(x => {
      x.role = UserRole.Operator;
      x.is_hail_enabled = true;
    });

    const user = await createUser(userDto);
    userDto.id = user.id;
    userDto.special_need_booking_android_deeplink_uri = 'http://test.ca';
    userDto.special_need_booking_android_store_uri = 'http://test.ca';
    userDto.special_need_booking_ios_deeplink_uri = 'http://test.ca';
    userDto.special_need_booking_ios_store_uri = 'http://test.ca';
    userDto.special_need_booking_is_promoted_to_public = true;

    await updateUser(userDto);
  });
}

function testCreateAccountUserAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to create an Account `, async () => {
    const apiKey = await getImmutableUserApiKey(role);
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const user = await createUser(dtoCreate, apiKey);
    assert.exists(user.id);
  });
}

function testChangeApikeyAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to change an Apikey `, async () => {
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const apiKey = await getImmutableUserApiKey(role);
    const user = await createUser(dtoCreate);
    const previousApikey = user.apikey;
    const accountDto = await updateApikey(x => {
      x.id = user.id;
    }, apiKey);
    assert.strictEqual(accountDto.status, StatusCodes.OK);

    const newApikey = accountDto.body.apikey;
    assert.notStrictEqual(previousApikey, newApikey);
  });
}

function testChangePasswordAccessValid(role: UserRole) {
  it(`User with role ${UserRole[role]} should be able to change a Password `, async () => {
    const dtoCreate = copyUserTemplate(x => (x.role = UserRole.Stats));
    const user = await createUser(dtoCreate);
    const apiKey = await getImmutableUserApiKey(role);
    const previousPassword = user.password;
    const accountDto = await updatePassword(x => {
      x.id = user.id;
    }, apiKey);
    assert.strictEqual(accountDto.status, StatusCodes.OK);

    const newPassword = accountDto.body.password;
    assert.notStrictEqual(previousPassword, newPassword);

    const response = await login({
      login: user.email,
      password: newPassword
    });
    assert.strictEqual(response.status, StatusCodes.OK);
  });
}
