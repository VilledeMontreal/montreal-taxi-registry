// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { BadRequestError } from '../errorHandling/errors';
import { InquiryRequest } from '../inquiry/inquiry.dto';
import { validateInquiryRequest } from '../inquiry/inquiry.validators';
import { validateDtoProperties } from '../shared/validations/validators';
import { GofsLiteSupportedLangTypes, GofsLiteWaitTimeRequestDto } from './gofsLite.dto';
import { gofsLiteMapper } from './gofsLite.mapper';

export async function validateGofsLiteWaitTimeRequest(request: Request): Promise<InquiryRequest> {
  await validateDtoProperties(new GofsLiteWaitTimeRequestDto(), request.body);
  return validateInquiryRequest(gofsLiteMapper.toInquiryRequest(request.body as GofsLiteWaitTimeRequestDto));
}

export function validateLang(request: Request): GofsLiteSupportedLangTypes {
  const lang = request.params.lang.toLowerCase();
  if (!Object.values(GofsLiteSupportedLangTypes).includes(lang as GofsLiteSupportedLangTypes)) {
    throw new BadRequestError('Unsupported lang requested. Only fr/en available');
  }
  return lang as GofsLiteSupportedLangTypes;
}
