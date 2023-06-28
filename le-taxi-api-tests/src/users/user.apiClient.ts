// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { v4 as uuidv4 } from 'uuid';
import { configs } from '../../config/configs';
import { aFewSeconds } from '../shared/commonTests/testUtil';
import { UserRole } from '../shared/commonTests/UserRole';
import { getTestRunId } from '../shared/e2eTesting/testRunId';
import { IUser } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import {
  getSimpleUsingAccessToken,
  getTaxiRegistry,
  postSimple,
  postTaxiRegistry,
  putTaxiRegistry
} from '../shared/taxiRegistryHttp/taxiRegistryHttp';
import { getImmutableUserApiKey } from './user.sharedFixture';
import { copyUserTemplate } from './userDto.template';

const rootApiKey = configs.apiTests.rootApiKey;

export async function createPromotedOperator(dto: IUser, apiKey?: string) {
  if (dto.email === 'auto') dto.email = generateAutoEmail();
  if (dto.public_id === 'auto') dto.public_id = uuidv4();

  const userResponse = await postTaxiRegistry('/api/legacy-web/users', dto, apiKey, rootApiKey);
  await aFewSeconds(configs.inquiries.delayToExceedPromotion);
  return userResponse.body;
}

export async function createUser(dto: IUser, apiKey?: string) {
  if (dto.email === 'auto') dto.email = generateAutoEmail();
  if (dto.public_id === 'auto') dto.public_id = dto.role === UserRole.Operator ? uuidv4() : null;

  const userResponse = await postTaxiRegistry('/api/legacy-web/users', dto, apiKey, rootApiKey);
  return userResponse.body;
}

export async function updateUser(dto: IUser, apiKey?: string) {
  const userResponse = await putTaxiRegistry('/api/legacy-web/users', dto, apiKey, rootApiKey);
  return userResponse.body;
}

export async function getUser(id: string, apiKey?: string): Promise<IUser> {
  const userResponse = await getTaxiRegistry(`/api/legacy-web/users?id=${id}`, apiKey, rootApiKey);
  return userResponse.body[0];
}

export async function login(dto?: any): Promise<any> {
  if (!dto) {
    // tslint:disable-next-line: no-parameter-reassignment
    dto = {
      login: configs.apiTests.user,
      password: configs.apiTests.password
    };
  }

  const userResponse = await postSimple('/api/legacy-web/login/DoLogin', dto);
  return userResponse;
}

export async function getLoginUserinfo(accessToken?: string): Promise<any> {
  const userResponse = await getSimpleUsingAccessToken('/api/legacy-web/login/userinfo', accessToken);
  return userResponse;
}

let emailSeed = 0;
function generateAutoEmail(): string {
  const newEmail = `${getTestRunId()}-${emailSeed}@apitest.test`;
  emailSeed++;

  return newEmail;
}

export async function updateApikey(dto?: (x: any) => void, apiKey?: string) {
  const dtoCreateAccount = copyUserTemplate(dto);
  return await putAccountApikey(dtoCreateAccount, apiKey);
}

export async function updatePassword(dto?: (x: any) => void, apiKey?: string) {
  const dtoCreateAccount = copyUserTemplate(dto);
  return await putAccountPassword(dtoCreateAccount, apiKey);
}

async function putAccountApikey(dto: any, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Manager);
  return await putTaxiRegistry('/api/legacy-web/users/apikey', dto, apiKey, defaultApiKey);
}

async function putAccountPassword(dto: any, apiKey?: string) {
  const defaultApiKey = await getImmutableUserApiKey(UserRole.Manager);
  return await putTaxiRegistry('/api/legacy-web/users/password', dto, apiKey, defaultApiKey);
}
