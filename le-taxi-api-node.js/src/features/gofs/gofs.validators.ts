// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request } from "express";
import { BadRequestError } from "../errorHandling/errors";
import { InquiryRequest } from "../inquiry/inquiry.dto";
import { validateInquiryRequest } from "../inquiry/inquiry.validators";
import { validateDtoProperties } from "../shared/validations/validators";
import {
  GofsRealtimeBookingRequestDto,
  GofsSupportedLangTypes,
} from "./gofs.dto";
import { gofsMapper } from "./gofs.mapper";

export async function validateGofsRealtimeBookingRequest(
  request: Request,
): Promise<InquiryRequest> {
  const brandId = request.query.brand_id as string;
  const brandIdArray = brandId?.length > 0 ? brandId.split(",") : [];
  const requestDto = { ...request.query, brand_id: brandIdArray };
  await validateDtoProperties(new GofsRealtimeBookingRequestDto(), requestDto);
  return validateInquiryRequest(
    gofsMapper.toInquiryRequest(requestDto as GofsRealtimeBookingRequestDto),
  );
}

export function validateLang(request: Request): GofsSupportedLangTypes {
  const lang = request.params.lang.toLowerCase();
  if (
    !Object.values(GofsSupportedLangTypes).includes(
      lang as GofsSupportedLangTypes,
    )
  ) {
    throw new BadRequestError(
      "Unsupported lang requested. Only fr/en available",
    );
  }
  return lang as GofsSupportedLangTypes;
}
