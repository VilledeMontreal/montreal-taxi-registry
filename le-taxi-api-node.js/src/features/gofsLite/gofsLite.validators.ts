// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import { BadRequestError } from "../errorHandling/errors";
import { InquiryRequest } from "../inquiry/inquiry.dto";
import { validateInquiryRequest } from "../inquiry/inquiry.validators";
import { validateDtoProperties } from "../shared/validations/validators";
import {
  GofsLiteRealtimeBookingRequestDto,
  GofsLiteSupportedLangTypes,
} from "./gofsLite.dto";
import { gofsLiteMapper } from "./gofsLite.mapper";

export async function validateGofsLiteRealtimeBookingRequest(
  request: Request
): Promise<InquiryRequest> {
  const brandId = request.query.brand_id as string;
  const brandIdArray = brandId?.length > 0 ? brandId.split(",") : [];
  const requestDto = { ...request.query, brand_id: brandIdArray };
  await validateDtoProperties(
    new GofsLiteRealtimeBookingRequestDto(),
    requestDto
  );
  return validateInquiryRequest(
    gofsLiteMapper.toInquiryRequest(
      requestDto as GofsLiteRealtimeBookingRequestDto
    )
  );
}

export function validateLang(request: Request): GofsLiteSupportedLangTypes {
  const lang = request.params.lang.toLowerCase();
  if (
    !Object.values(GofsLiteSupportedLangTypes).includes(
      lang as GofsLiteSupportedLangTypes
    )
  ) {
    throw new BadRequestError(
      "Unsupported lang requested. Only fr/en available"
    );
  }
  return lang as GofsLiteSupportedLangTypes;
}
