// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { v4 as uuidv4 } from 'uuid';
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
  if (role === UserRole.Operator) {
    const promotions = { standard: true, minivan: true, special_need: true };
    const promotedOperator = await createOperatorWithPromotion(promotions);
    return Object.freeze(promotedOperator);
  }

  const userDto = copyUserTemplate(x => {
    x.role = role;
  });
  const user = await createUser(userDto);
  return Object.freeze(user);
}

export async function getImmutableUserApiKey(role: UserRole) {
  const immutableUser = await getImmutableUser(role);
  return immutableUser.apikey;
}

export async function createNonImmutableUser(role: UserRole) {
  const userDto = copyUserTemplate(x => (x.role = role));
  return await createUser(userDto);
}

export async function createOperatorWithPromotion(promotions: IPromotions) {
  const now = new Date(Date.now()).toISOString();
  const userDto = copyUserTemplate(x => {
    x.role = UserRole.Operator;
    x.operator_api_key = uuidv4();
    x.standard_booking_website_url = 'http://test.ca';
    x.standard_booking_is_promoted_to_public = promotions.standard;
    x.standard_booking_inquiries_starts_at = promotions.standard ? now : null;
    x.minivan_booking_is_available_from_web_url = true;
    x.minivan_booking_is_promoted_to_public = promotions.minivan;
    x.minivan_booking_inquiries_starts_at = promotions.minivan ? now : null;
    x.special_need_booking_website_url = 'http://test.ca';
    x.special_need_booking_is_promoted_to_public = promotions.special_need;
    x.special_need_booking_inquiries_starts_at = promotions.special_need ? now : null;
  });

  return await createPromotedOperator(userDto);
}
