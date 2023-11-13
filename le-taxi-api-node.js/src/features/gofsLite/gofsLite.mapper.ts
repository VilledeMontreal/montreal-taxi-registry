// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InquiryRequest, InquiryResponse, InquiryResponseData, InquiryTypes } from '../inquiry/inquiry.dto';
import {
  GofsLiteBrandIdTypes,
  GofsLiteRealtimeBookingDataResponseDto,
  GofsLiteRealtimeBookingResponseDto,
  GofsLiteRealtimeBookingRequestDto
} from './gofsLite.dto';

class GofsLiteMapper {
  public toInquiryRequest(gofsLiteRealtimeBookingRequest: GofsLiteRealtimeBookingRequestDto): InquiryRequest {
    return {
      from: {
        lat: gofsLiteRealtimeBookingRequest.pickup_lat,
        lon: gofsLiteRealtimeBookingRequest.pickup_lon
      },
      to: {
        lat: gofsLiteRealtimeBookingRequest.drop_off_lat,
        lon: gofsLiteRealtimeBookingRequest.drop_off_lon
      },
      inquiryTypes: toInquiryTypes(gofsLiteRealtimeBookingRequest.brand_id)
    };
  }

  public toGofsLiteRealtimeBookingResponse(inquiryResponse: InquiryResponse): GofsLiteRealtimeBookingResponseDto {
    return {
      realtime_booking: inquiryResponse.data?.map(data => toRealtimeBookingResponseData(data)) || []
    };
  }
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

function toRealtimeBookingResponseData(data: InquiryResponseData): GofsLiteRealtimeBookingDataResponseDto {
  const hasDestination = !!data.estimatedTravelTime;
  const response = {
    brand_id: toBrandId(data.inquiryType),
    wait_time: data.estimatedWaitTime,
    travel_time: data.estimatedTravelTime,
    travel_cost: data.estimatedPrice,
    travel_cost_currency: 'CAD',
    booking_detail: {
      service_name: data.booking.operator.commercial_name,
      phone_number: data.booking.phoneNumber,
      web_uri: data.booking.webUrl,
      android_uri: data.booking.androidUri,
      ios_uri: data.booking.iosUri
    }
  };

  if (!hasDestination) {
    response.travel_time = null;
    response.travel_cost = null;
    response.travel_cost_currency = null;
  }

  return response;
}

export const gofsLiteMapper = new GofsLiteMapper();
