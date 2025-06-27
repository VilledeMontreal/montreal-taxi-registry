// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  InquiryRequest,
  InquiryResponse,
  InquiryResponseData,
  InquiryTypes,
} from "../../inquiry/inquiry.dto";
import {
  addMinutes,
  addSec,
  nowUtcIsoString,
} from "../../shared/dateUtils/dateUtils";
import {
  GtfsAssetTypes,
  GtfsInquiryRequestDto,
  GtfsInquiryResponseDto,
  GtfsInquiryResponseOptionsDto,
} from "./gtfsInquiry.dto";

class GtfsInquiryMapper {
  public toInquiryRequest(
    gtfsInquiryRequest: GtfsInquiryRequestDto
  ): InquiryRequest {
    return {
      from: {
        lat: gtfsInquiryRequest.from.coordinates.lat,
        lon: gtfsInquiryRequest.from.coordinates.lon,
        address: gtfsInquiryRequest.from.physicalAddress?.streetAddress,
      },
      to: {
        lat: gtfsInquiryRequest.to?.coordinates?.lat,
        lon: gtfsInquiryRequest.to?.coordinates?.lon,
        address: gtfsInquiryRequest.to?.physicalAddress?.streetAddress,
      },
      inquiryTypes: toInquiryTypes(gtfsInquiryRequest.useAssetTypes),
      operators: gtfsInquiryRequest.operators,
    };
  }

  public toGtfsInquiryResponse(
    inquiryResponse: InquiryResponse
  ): GtfsInquiryResponseDto {
    const now =
      inquiryResponse?.data?.length > 0
        ? inquiryResponse.data[0].date
        : nowUtcIsoString();
    return {
      validUntil: addMinutes(now, 5),
      options:
        inquiryResponse.data?.map((data) =>
          toInquiryResponseOptions(data, now)
        ) || [],
    };
  }
}

function toInquiryTypes(gtfsAssetTypes: GtfsAssetTypes[]): InquiryTypes[] {
  return gtfsAssetTypes.map((gtfsAssetType) => toInquiryType(gtfsAssetType));
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

function toInquiryResponseOptions(
  data: InquiryResponseData,
  now: string
): GtfsInquiryResponseOptionsDto {
  const hasDestination = !!data.estimatedTravelTime;
  const departureTime = addSec(now, data.estimatedWaitTime);
  const arrivalTime = hasDestination
    ? addSec(departureTime, data.estimatedTravelTime)
    : null;
  const assetType = toAssetType(data.inquiryType);

  const response = {
    mainAssetType: {
      id: assetType,
    },
    departureTime,
    arrivalTime,
    from: {
      coordinates: {
        lat: data.from.lat,
        lon: data.from.lon,
      },
      physicalAddress: {
        streetAddress: data.from.address,
      },
    },
    to: {
      coordinates: {
        lat: data.to.lat,
        lon: data.to.lon,
      },
      physicalAddress: {
        streetAddress: data.to.address,
      },
    },
    pricing: {
      estimated: true,
      parts: [
        {
          amount: data.estimatedPrice,
          currencyCode: "CAD",
        },
      ],
    },
    estimatedWaitTime: data.estimatedWaitTime,
    estimatedTravelTime: data.estimatedTravelTime,
    booking: {
      agency: {
        id: data.booking.operator.public_id,
        name: data.booking.operator.commercial_name,
      },
      mainAssetType: {
        id: toMainAssetType(assetType, data.booking.operator.public_id),
      },
      phoneNumber: data.booking.phoneNumber,
      androidUri: data.booking.androidUri,
      iosUri: data.booking.iosUri,
      webUrl: data.booking.webUrl,
    },
  };

  if (data.from.address === null || data.from.address === undefined)
    delete response.from.physicalAddress;

  if (data.to.address === null || data.to.address === undefined)
    delete response.to.physicalAddress;

  if (!hasDestination) {
    response.to.coordinates = null;
    response.pricing = null;
    response.estimatedTravelTime = null;
  }

  return response;
}

function toMainAssetType(assetType: GtfsAssetTypes, operatorPublicId: string) {
  const assetTypeExtension = getMainAssetTypeExtension(assetType);
  return `${operatorPublicId}-${assetTypeExtension}`;
}

function getMainAssetTypeExtension(assetType: GtfsAssetTypes) {
  switch (assetType) {
    case GtfsAssetTypes.SpecialNeed:
      return "standard";
    case GtfsAssetTypes.Minivan:
      return "minivan";
    default:
    case GtfsAssetTypes.Standard:
      return "special-need";
  }
}

export const gtfsInquiryMapper = new GtfsInquiryMapper();
