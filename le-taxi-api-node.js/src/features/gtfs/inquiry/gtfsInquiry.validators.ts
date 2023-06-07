// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from 'express';
import { InquiryRequest } from '../../inquiry/inquiry.dto';
import { validateInquiryRequest } from '../../inquiry/inquiry.validators';
import { validateDtoProperties } from '../../shared/validations/validators';
import { GtfsInquiryRequestDto } from './gtfsInquiry.dto';
import { gtfsInquiryMapper } from './gtfsInquiry.mapper';

export async function validateGtfsInquiryRequest(request: Request): Promise<InquiryRequest> {
  await validateDtoProperties(new GtfsInquiryRequestDto(), request.body);
  return validateInquiryRequest(gtfsInquiryMapper.toInquiryRequest(request.body as GtfsInquiryRequestDto));
}
