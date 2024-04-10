// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { alphabets, character } from 'passhelp';
import * as uuid from 'uuid4';
import { configs } from '../../config/configs';
import { BadRequestError } from '../errorHandling/errors';
import { addSec, nowUtcIsoString } from '../shared/dateUtils/dateUtils';
import { validateDtoProperties } from '../shared/validations/validators';
import { UserRequestDto } from '../users/user.dto';
import { UserModel } from './user.model';
import { userRepository } from './user.repository';
import { UserRoleId } from './userRole';

export async function validateUserRequest(request: Request): Promise<UserRequestDto> {
  const data = request && request.body;

  await validateDtoProperties(new UserRequestDto(), data);
  ensureOperatorHasPublicId(data);
  ensureOperatorHasWebsiteUrl(data);
  ensureMinimalInformationForPublicPromotion(data);

  return data;
}

export function validateUpdatePasswordRequest(request: Request): any {
  if (!request.body || !request.body.id) throw new BadRequestError('Data validation failed');

  const password = generatePassword();
  return { userId: request.body.id, password };
}

export function validateUpdateApikeyRequest(request: Request): any {
  if (!request.body || !request.body.id) throw new BadRequestError('Data validation failed');

  const apikey = generateApikey();
  return { userId: request.body.id, apikey };
}

export function prepareDtoForInsertion(userRequestDto: UserRequestDto): UserRequestDto {
  const user = sanitizeDto(userRequestDto);

  const now = nowUtcIsoString();
  user.apikey = generateApikey();
  user.password = generatePassword();
  user.active = true;
  user.confirmed_at = now;
  updateInquiriesStartTime(user);
  return user;
}

export async function prepareDtoForUpdate(userRequestDto: UserRequestDto): Promise<UserRequestDto> {
  const user = sanitizeDto(userRequestDto);
  const previousUser = await userRepository.getUserById(userRequestDto.id);
  updateInquiriesStartTime(user, previousUser);
  return user;
}

function updateInquiriesStartTime(user: UserRequestDto, previousUser: UserModel = null): UserRequestDto {
  const startTime = addSec(nowUtcIsoString(), configs.inquiries.promotionDelayInSec);

  if (
    promotionStateChanged(
      user.standard_booking_is_promoted_to_public,
      previousUser?.standard_booking_is_promoted_to_public ?? false
    )
  ) {
    user.standard_booking_inquiries_starts_at = user.standard_booking_is_promoted_to_public ? startTime : null;
  }

  if (
    promotionStateChanged(
      user.minivan_booking_is_promoted_to_public,
      previousUser?.minivan_booking_is_promoted_to_public ?? false
    )
  ) {
    user.minivan_booking_inquiries_starts_at = user.minivan_booking_is_promoted_to_public ? startTime : null;
  }

  if (
    promotionStateChanged(
      user.special_need_booking_is_promoted_to_public,
      previousUser?.special_need_booking_is_promoted_to_public ?? false
    )
  ) {
    user.special_need_booking_inquiries_starts_at = user.special_need_booking_is_promoted_to_public ? startTime : null;
  }

  return user;
}

function promotionStateChanged(promoted: boolean, previouslyPromoted: boolean) {
  return (promoted && !previouslyPromoted) || (previouslyPromoted && !promoted);
}

function sanitizeDto(userRequestDto: UserRequestDto): UserRequestDto {
  const user = Object.assign(new UserRequestDto(), userRequestDto);
  user.phone_number_technical = parsePhoneNumber(user.phone_number_technical);
  user.standard_booking_phone_number = parsePhoneNumber(user.standard_booking_phone_number);
  user.special_need_booking_phone_number = parsePhoneNumber(user.special_need_booking_phone_number);
  user.standard_booking_is_promoted_to_public = user.standard_booking_is_promoted_to_public ?? false;
  user.minivan_booking_is_available_from_web_url = user.minivan_booking_is_available_from_web_url ?? false;
  user.minivan_booking_is_available_from_android_uri = user.minivan_booking_is_available_from_android_uri ?? false;
  user.minivan_booking_is_available_from_ios_uri = user.minivan_booking_is_available_from_ios_uri ?? false;
  user.minivan_booking_is_promoted_to_public = user.minivan_booking_is_promoted_to_public ?? false;
  user.special_need_booking_is_promoted_to_public = user.special_need_booking_is_promoted_to_public ?? false;
  return user;
}

function generateApikey() {
  return uuid();
}

function generatePassword() {
  return character(12, alphabets.alphanumeric, true);
}

function parsePhoneNumber(phoneNumber: string): string {
  return phoneNumber && (parsePhoneNumberFromString(phoneNumber, 'US').number as string);
}

function ensureOperatorHasPublicId(user: UserRequestDto): void {
  if (user.role === UserRoleId.Operator && !user.public_id) {
    throw new BadRequestError('Operators must be provided with a public_id');
  }
}

function ensureOperatorHasWebsiteUrl(user: UserRequestDto): void {
  if (user.role === UserRoleId.Operator && !user.website_url) {
    throw new BadRequestError('Operators must be provided with a website_url');
  }
}

function ensureMinimalInformationForPublicPromotion(user: UserRequestDto): void {
  ensureStandardBookingMinimalInformation(user);
  ensureMinivanBookingMinimalInformation(user);
  ensureSpecialNeedBookingMinimalInformation(user);
}

function ensureStandardBookingMinimalInformation(user: UserRequestDto) {
  if (
    user.standard_booking_is_promoted_to_public &&
    user.standard_booking_android_deeplink_uri &&
    !user.standard_booking_android_store_uri
  ) {
    throw new BadRequestError(
      'In order to promote publicly standard taxis, store uri is mandatory when deep link uri is provided for App (Android & iOS)'
    );
  }

  if (
    user.standard_booking_is_promoted_to_public &&
    user.standard_booking_ios_deeplink_uri &&
    !user.standard_booking_ios_store_uri
  ) {
    throw new BadRequestError(
      'In order to promote publicly standard taxis, store uri is mandatory when deep link uri is provided for App (Android & iOS)'
    );
  }

  if (
    user.standard_booking_is_promoted_to_public &&
    !(
      user.standard_booking_phone_number ||
      user.standard_booking_website_url ||
      (user.standard_booking_android_deeplink_uri &&
        user.standard_booking_android_store_uri &&
        user.standard_booking_ios_deeplink_uri &&
        user.standard_booking_ios_store_uri)
    )
  ) {
    throw new BadRequestError(
      'In order to promote publicly standard taxis, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
    );
  }
}

function ensureMinivanBookingMinimalInformation(user: UserRequestDto) {
  if (user.minivan_booking_is_promoted_to_public && !user.standard_booking_is_promoted_to_public) {
    throw new BadRequestError('In order to promote publicly minivans, standard booking must be available');
  }

  if (user.minivan_booking_is_available_from_web_url && !user.standard_booking_website_url) {
    throw new BadRequestError(
      'In order to promote publicly minivans from web, standard booking from web must be available'
    );
  }

  if (user.minivan_booking_is_available_from_android_uri && !user.standard_booking_android_deeplink_uri) {
    throw new BadRequestError(
      'In order to promote publicly minivans from android, standard booking from android must be available'
    );
  }

  if (user.minivan_booking_is_available_from_ios_uri && !user.standard_booking_ios_deeplink_uri) {
    throw new BadRequestError(
      'In order to promote publicly minivans from iOS, standard booking from iOS must be available'
    );
  }

  if (
    user.minivan_booking_is_promoted_to_public &&
    !(
      user.standard_booking_phone_number ||
      user.minivan_booking_is_available_from_web_url ||
      (user.minivan_booking_is_available_from_android_uri && user.minivan_booking_is_available_from_ios_uri)
    )
  ) {
    throw new BadRequestError(
      'In order to promote publicly standard minivans, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
    );
  }
}

function ensureSpecialNeedBookingMinimalInformation(user: UserRequestDto) {
  if (
    user.special_need_booking_is_promoted_to_public &&
    user.special_need_booking_android_deeplink_uri &&
    !user.special_need_booking_android_store_uri
  ) {
    throw new BadRequestError(
      'In order to promote publicly special need taxis, store uri is mandatory when deep link uri is provided for App (Android & iOS)'
    );
  }

  if (
    user.special_need_booking_is_promoted_to_public &&
    user.special_need_booking_ios_deeplink_uri &&
    !user.special_need_booking_ios_store_uri
  ) {
    throw new BadRequestError(
      'In order to promote publicly special need taxis, store uri is mandatory when deep link uri is provided for App (Android & iOS)'
    );
  }

  if (
    user.special_need_booking_is_promoted_to_public &&
    !(
      user.special_need_booking_phone_number ||
      user.special_need_booking_website_url ||
      (user.special_need_booking_android_deeplink_uri &&
        user.special_need_booking_android_store_uri &&
        user.special_need_booking_ios_deeplink_uri &&
        user.special_need_booking_ios_store_uri)
    )
  ) {
    throw new BadRequestError(
      'In order to promote publicly special need taxis, at least one of these means should be provided: Phone, Web, or App (Android & iOS)'
    );
  }
}
