// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InquiryRequest, InquiryResponse, InquiryResponseData, InquiryTypes } from "../inquiry/inquiry.dto";
import { GofsLiteBrandIdTypes, GofsLiteWaitTimeDataResponseDto, GofsLiteWaitTimeRequestDto, GofsLiteWaitTimeResponseDto } from "./gofsLite.dto";

class GofsLiteMapper {
  public toInquiryRequest(gofsLiteWaitTimeRequest: GofsLiteWaitTimeRequestDto): InquiryRequest {
    return {
      from: {
        lat: gofsLiteWaitTimeRequest.pickup_lat,
        lon: gofsLiteWaitTimeRequest.pickup_lon
      },
      to: {
        lat: gofsLiteWaitTimeRequest.drop_off_lat,
        lon: gofsLiteWaitTimeRequest.drop_off_lon
      },
      inquiryTypes: toInquiryTypes(gofsLiteWaitTimeRequest.brand_id),
    }
  }

  public toGofsLiteWaitTimeResponse(inquiryResponse: InquiryResponse): GofsLiteWaitTimeResponseDto {
    return {
      wait_times: inquiryResponse.data?.map(data => toWaitTimeResponseData(data)) || []
    }
  };
}

function toInquiryTypes(gofsBrandIds: GofsLiteBrandIdTypes[]): InquiryTypes[] {
  return gofsBrandIds.map(gofsBrandId => toInquiryType(gofsBrandId));
}

function toInquiryType(gofsBrandId: GofsLiteBrandIdTypes): InquiryTypes {
  switch (gofsBrandId) {
    default:
    case GofsLiteBrandIdTypes.Standard:
      return InquiryTypes.Standard;
    case GofsLiteBrandIdTypes.Minivan:
      return InquiryTypes.Minivan;
    case GofsLiteBrandIdTypes.SpecialNeed:
      return InquiryTypes.SpecialNeed;
  }
}

export function toBrandId(inquiryTypes: InquiryTypes): GofsLiteBrandIdTypes {
  switch (inquiryTypes) {
    default:
    case InquiryTypes.Standard:
      return GofsLiteBrandIdTypes.Standard;
    case InquiryTypes.Minivan:
      return GofsLiteBrandIdTypes.Minivan;
    case InquiryTypes.SpecialNeed:
      return GofsLiteBrandIdTypes.SpecialNeed;
  }
}

function toWaitTimeResponseData(data: InquiryResponseData): GofsLiteWaitTimeDataResponseDto {
  const isSpecialNeed = data.inquiryType === InquiryTypes.SpecialNeed;

  return {
    brand_id: toBrandId(data.inquiryType),
    estimated_wait_time: data.estimatedWaitTime,
    estimated_travel_time: data.estimatedTravelTime,
    estimated_travel_cost: 0,
    estimated_travel_cost_currency: 'CAD',
    realtime_booking: {
      booking_detail: {
        service_name: data.operator.commercial_name,
        android_uri: isSpecialNeed ? data.operator.special_need_booking_android_deeplink_uri : data.operator.standard_booking_android_deeplink_uri,
        ios_uri: isSpecialNeed ? data.operator.special_need_booking_ios_deeplink_uri : data.operator.standard_booking_ios_deeplink_uri,
        web_uri: isSpecialNeed ? data.operator.special_need_booking_website_url : data.operator.standard_booking_website_url,
        phone_number: isSpecialNeed ? data.operator.special_need_booking_phone_number : data.operator.standard_booking_phone_number,
      }
    }
  }
}

export const gofsLiteMapper = new GofsLiteMapper();
