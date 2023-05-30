// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InquiryRequest, InquiryResponse, InquiryResponseData, InquiryTypes } from "../../inquiry/inquiry.dto";
import { addMinutes, addSec, nowUtcIsoString } from "../../shared/dateUtils/dateUtils";
import { GtfsAssetTypes, GtfsInquiryRequestDto, GtfsInquiryResponseDto, GtfsInquiryResponseOptionsDto } from "./gtfsInquiry.dto";

class GtfsInquiryMapper {
  public toInquiryRequest(gtfsInquiryRequest: GtfsInquiryRequestDto): InquiryRequest {
    return {
      from: {
        lat: gtfsInquiryRequest.from.coordinates.lat,
        lon: gtfsInquiryRequest.from.coordinates.lon
      },
      to: {
        lat: gtfsInquiryRequest.to.coordinates.lat,
        lon: gtfsInquiryRequest.to.coordinates.lon
      },
      inquiryTypes: toInquiryTypes(gtfsInquiryRequest.useAssetTypes),
      operators: gtfsInquiryRequest.operators
    }
  }

  public toGtfsInquiryResponse(inquiryResponse: InquiryResponse): GtfsInquiryResponseDto {
    const now = nowUtcIsoString();
    return {
      validUntil: addMinutes(now, 5),
      options: inquiryResponse.data?.map(data => toInquiryResponseOptions(data, now)) || []
    }
  };
}

function toInquiryTypes(gtfsAssetTypes: GtfsAssetTypes[]): InquiryTypes[] {
  return gtfsAssetTypes.map(gtfsAssetType => toInquiryType(gtfsAssetType));
}

function toInquiryType(gtfsAssetType: GtfsAssetTypes): InquiryTypes {
  switch (gtfsAssetType) {
    default:
    case GtfsAssetTypes.Standard:
      return InquiryTypes.Standard;
    case GtfsAssetTypes.Minivan:
      return InquiryTypes.Minivan;
    case GtfsAssetTypes.SpecialNeed:
      return InquiryTypes.SpecialNeed;
  }
}

export function toAssetType(inquiryTypes: InquiryTypes): GtfsAssetTypes {
  switch (inquiryTypes) {
    default:
    case InquiryTypes.Standard:
      return GtfsAssetTypes.Standard;
    case InquiryTypes.Minivan:
      return GtfsAssetTypes.Minivan;
    case InquiryTypes.SpecialNeed:
      return GtfsAssetTypes.SpecialNeed;
  }
}

function toInquiryResponseOptions(data: InquiryResponseData, now: string): GtfsInquiryResponseOptionsDto {
  const departureTime = addSec(now, data.estimatedWaitTime);
  const arrivalTime = addSec(departureTime, data.estimatedTravelTime);
  const isSpecialNeed = data.inquiryType === InquiryTypes.SpecialNeed;
  const assetType = toAssetType(data.inquiryType);

  return {
    mainAssetType: {
      id: assetType,
    },
    departureTime,
    arrivalTime,
    from: {
      coordinates: data.from,
    },
    to: {
      coordinates: data.to,
    },
    pricing: {
      estimated: true,
      parts: [
        {
          optimisticAmount: 0,
          amount: 0,
          pessimisticAmount: 0,
          currencyCode: 'CAD'
        }
      ]
    },
    estimatedWaitTime: data.estimatedWaitTime,
    estimatedTravelTime: data.estimatedTravelTime,
    booking: {
      agency: {
        id: data.operator.public_id,
        name: data.operator.commercial_name
      },
      mainAssetType: {
        id: toMainAssetType(assetType, data.operator.public_id),
      },
      phoneNumber: isSpecialNeed ? data.operator.special_need_booking_phone_number : data.operator.standard_booking_phone_number,
      androidUri: isSpecialNeed ? data.operator.special_need_booking_android_deeplink_uri : data.operator.standard_booking_android_deeplink_uri,
      iosUri: isSpecialNeed ? data.operator.special_need_booking_ios_deeplink_uri : data.operator.standard_booking_ios_deeplink_uri,
      webUrl: isSpecialNeed ? data.operator.special_need_booking_website_url : data.operator.standard_booking_website_url,
    }
  };
}

function toMainAssetType(assetType: GtfsAssetTypes, operatorPublicId: string) {
  const assetTypeExtension = getMainAssetTypeExtension(assetType);
  return `${operatorPublicId}-${assetTypeExtension}`;
}

function getMainAssetTypeExtension(assetType: GtfsAssetTypes) {
  switch (assetType) {
    case GtfsAssetTypes.SpecialNeed:
      return 'standard-route';
    case GtfsAssetTypes.Minivan:
      return 'minivan-route';
    default:
    case GtfsAssetTypes.Standard:
      return 'special-need-route';
  }
}

export const gtfsInquiryMapper = new GtfsInquiryMapper();
