// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  InquiryRequest,
  InquiryResponse,
  InquiryResponseData,
  InquiryTypes,
} from "../inquiry/inquiry.dto";
import {
  GofsBrandIdTypes,
  GofsRealtimeBookingDataResponseDto,
  GofsRealtimeBookingRequestDto,
  GofsRealtimeBookingResponseDto,
} from "./gofs.dto";

class GofsMapper {
  public toInquiryRequest(
    gofsRealtimeBookingRequest: GofsRealtimeBookingRequestDto,
  ): InquiryRequest {
    return {
      from: {
        lat: gofsRealtimeBookingRequest.pickup_lat,
        lon: gofsRealtimeBookingRequest.pickup_lon,
        address: gofsRealtimeBookingRequest.pickup_address,
      },
      to: {
        lat: gofsRealtimeBookingRequest.drop_off_lat,
        lon: gofsRealtimeBookingRequest.drop_off_lon,
        address: gofsRealtimeBookingRequest.drop_off_address,
      },
      inquiryTypes: toInquiryTypes(gofsRealtimeBookingRequest.brand_id),
    };
  }

  public toGofsRealtimeBookingResponse(
    inquiryResponse: InquiryResponse,
  ): GofsRealtimeBookingResponseDto {
    return {
      realtime_booking:
        inquiryResponse.data?.map((data) =>
          toRealtimeBookingResponseData(data),
        ) || [],
    };
  }
}

function toInquiryTypes(gofsBrandIds: GofsBrandIdTypes[]): InquiryTypes[] {
  return gofsBrandIds.map((gofsBrandId) => toInquiryType(gofsBrandId));
}

function toInquiryType(gofsBrandId: GofsBrandIdTypes): InquiryTypes {
  switch (gofsBrandId) {
    default:
    case GofsBrandIdTypes.Standard:
      return InquiryTypes.Standard;
    case GofsBrandIdTypes.Minivan:
      return InquiryTypes.Minivan;
    case GofsBrandIdTypes.SpecialNeed:
      return InquiryTypes.SpecialNeed;
  }
}

export function toBrandId(inquiryTypes: InquiryTypes): GofsBrandIdTypes {
  switch (inquiryTypes) {
    default:
    case InquiryTypes.Standard:
      return GofsBrandIdTypes.Standard;
    case InquiryTypes.Minivan:
      return GofsBrandIdTypes.Minivan;
    case InquiryTypes.SpecialNeed:
      return GofsBrandIdTypes.SpecialNeed;
  }
}

function toRealtimeBookingResponseData(
  data: InquiryResponseData,
): GofsRealtimeBookingDataResponseDto {
  const hasDestination = !!data.estimatedTravelTime;
  const response = {
    brand_id: toBrandId(data.inquiryType),
    wait_time: data.estimatedWaitTime,
    travel_time: data.estimatedTravelTime,
    travel_cost: data.estimatedPrice,
    travel_cost_currency: "CAD",
    booking_detail: {
      service_name: data.booking.operator.commercial_name,
      phone_number: data.booking.phoneNumber,
      web_uri: data.booking.webUrl,
      android_uri: data.booking.androidUri,
      ios_uri: data.booking.iosUri,
    },
  };

  if (!hasDestination) {
    response.travel_time = null;
    response.travel_cost = null;
    response.travel_cost_currency = null;
  }

  return response;
}

export const gofsMapper = new GofsMapper();
