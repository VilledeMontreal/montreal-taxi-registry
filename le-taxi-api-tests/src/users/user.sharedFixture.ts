// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { v4 as uuidv4 } from 'uuid';
import { getAbsoluteUrl } from '../../config/configs';
import { UserRole } from '../shared/commonTests/UserRole';
import { IUser } from '../shared/taxiRegistryDtos/taxiRegistryDtos';
import { createPromotedOperator, createUser } from './user.apiClient';
import { copyUserTemplate } from './userDto.template';

export interface IPromotions {
  standard: boolean;
  minivan: boolean;
  special_need: boolean;
}

const createImmutableUserPromiseByRole: { [id: number]: Promise<IUser> } = {};
export async function getImmutableUser(role: UserRole): Promise<IUser> {
  if (!createImmutableUserPromiseByRole[role]) {
    createImmutableUserPromiseByRole[role] = createImmutableUser(role);
  }
  return await createImmutableUserPromiseByRole[role];
}

async function createImmutableUser(role: UserRole) {
  const fakeOperatorHailEndpointUrl = getAbsoluteUrl(`/api/fakes/fake-hail-with-phone`);
  if (role === UserRole.Operator) {
    const promotions = { standard: true, minivan: true, special_need: true };
    const promotedOperator = await createOperatorWithPromotion(promotions, fakeOperatorHailEndpointUrl);
    return Object.freeze(promotedOperator);
  }

  const userDto = copyUserTemplate(x => {
    x.role = role;
    x.hail_endpoint_production = fakeOperatorHailEndpointUrl;
  });
  const user = await createUser(userDto);
  return Object.freeze(user);
}

export async function getImmutableUserApiKey(role: UserRole) {
  const immutableUser = await getImmutableUser(role);
  return immutableUser.apikey;
}

export async function createNonImmutableUser(role: UserRole, hailEnabled: boolean = false) {
  const fakeOperatorHailEndpointUrl = getAbsoluteUrl(`/api/fakes/fake-hail`);

  const userDto = copyUserTemplate(x => {
    x.role = role;
    x.is_hail_enabled = hailEnabled;
    x.hail_endpoint_production = fakeOperatorHailEndpointUrl;
  });

  return await createUser(userDto);
}

export async function createOperatorWithPromotion(promotions: IPromotions, fakeHail: string = null) {
  const userDto = copyUserTemplate(x => {
    x.role = UserRole.Operator;
    x.is_hail_enabled = true;
    x.operator_api_key = uuidv4();
    x.hail_endpoint_production = fakeHail;
    x.standard_booking_website_url = 'http://test.ca';
    x.standard_booking_is_promoted_to_public = promotions.standard;
    x.minivan_booking_is_available_from_web_url = true;
    x.minivan_booking_is_promoted_to_public = promotions.minivan;
    x.special_need_booking_website_url = 'http://test.ca';
    x.special_need_booking_is_promoted_to_public = promotions.special_need;
  });

  return await createPromotedOperator(userDto);
}
