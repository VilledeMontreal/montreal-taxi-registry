// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { BadRequestError } from '../errorHandling/errors';
import { InquiryRequest } from '../inquiry/inquiry.dto';
import { validateInquiryRequest } from '../inquiry/inquiry.validators';
import { validateDtoProperties } from '../shared/validations/validators';
import { GofsLiteWaitTimeRequestDto } from './gofsLite.dto';
import { gofsLiteMapper } from './gofsLite.mapper';

export async function validateGofsLiteWaitTimeRequest(request: Request): Promise<InquiryRequest> {
  validateRequestParams(request);
  await validateDtoProperties(new GofsLiteWaitTimeRequestDto(), request.body);
  return validateInquiryRequest(gofsLiteMapper.toInquiryRequest(request.body as GofsLiteWaitTimeRequestDto));
}

function validateRequestParams(request: Request) {
  const lang = request.params.lang.toLowerCase();
  if (lang !== 'en' && lang !== 'fr')
    throw new BadRequestError('Unsupported lang requested. Only fr/en available');
}
