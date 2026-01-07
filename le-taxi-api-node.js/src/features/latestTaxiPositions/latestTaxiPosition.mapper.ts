// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { InquiryTypes } from "../inquiry/inquiry.dto";
import { ModelMap } from "../shared/caching/modelMap";
import { nowUtcIsoString } from "../shared/dateUtils/dateUtils";
import { TaxiPositionSnapshotItemRequestDto } from "../taxiPositionSnapshot/taxiPositionSnapshotItemRequest.dto";
import { TaxiPositionSnapshotRequestDto } from "../taxiPositionSnapshot/taxiPositionSnapshotRequest.dto";
import { TaxiSummaryModel } from "../taxiSummaries/taxiSummary.model";
import { UserModel } from "../users/user.model";
import {
  LatestTaxiPositionModel,
  LatestTaxiPositionModelExtended,
} from "./latestTaxiPosition.model";

class LatestTaxiPositionMapper {
  public mongoToLatestTaxiPositionModel(
    mongoResult: any,
  ): LatestTaxiPositionModel {
    if (!mongoResult) return mongoResult;
    return {
      taxiId: mongoResult._id,
      lon: mongoResult.location.coordinates[0],
      lat: mongoResult.location.coordinates[1],
      status: mongoResult.status,
      isPromoted: mongoResult.isPromoted,
      timestampUnixTime: mongoResult.timestampUnixTime,
      receivedAt: mongoResult.receivedAt,
      taxi: mongoResult.taxi,
    };
  }

  public mongoToLatestTaxiPositionModelExtended(
    mongoResult: any,
    inquiryType: InquiryTypes,
  ): LatestTaxiPositionModelExtended {
    const latestTaxiPositionExtended = this.mongoToLatestTaxiPositionModel(
      mongoResult,
    ) as LatestTaxiPositionModelExtended;
    if (latestTaxiPositionExtended)
      latestTaxiPositionExtended.taxi.inquiryType = inquiryType;
    return latestTaxiPositionExtended;
  }

  public toLatestTaxiPositionModels(
    taxiSummaryReferences: ModelMap<TaxiSummaryModel>,
    source: TaxiPositionSnapshotRequestDto,
    userModel: UserModel,
  ): LatestTaxiPositionModel[] {
    return source.items.map((item) =>
      this.toLatestTaxiPositionModel(
        taxiSummaryReferences,
        item,
        source.receivedAt,
        userModel,
      ),
    );
  }

  private toLatestTaxiPositionModel(
    taxiSummaryReferences: ModelMap<TaxiSummaryModel>,
    source: TaxiPositionSnapshotItemRequestDto,
    receivedAt: Date,
    userModel: UserModel,
  ): LatestTaxiPositionModel {
    return {
      taxiId: source.taxi,
      lat: Number.parseFloat(source.lat),
      lon: Number.parseFloat(source.lon),
      status: source.status,
      timestampUnixTime: Number.parseInt(source.timestamp, 10),
      receivedAt,
      taxi: taxiSummaryReferences[source.taxi],
      isPromoted: this.validatePromotion(
        taxiSummaryReferences[source.taxi],
        userModel,
      ),
    };
  }

  private validatePromotion(
    taxiSummary: TaxiSummaryModel,
    userModel: UserModel,
  ): boolean {
    const now = nowUtcIsoString();
    if (
      !taxiSummary.isMpv &&
      !taxiSummary.isSpecialNeedVehicle &&
      userModel.standard_booking_inquiries_starts_at &&
      userModel.standard_booking_inquiries_starts_at < now
    ) {
      return true;
    }
    if (
      taxiSummary.isMpv &&
      !taxiSummary.isSpecialNeedVehicle &&
      userModel.minivan_booking_inquiries_starts_at &&
      userModel.minivan_booking_inquiries_starts_at < now
    ) {
      return true;
    }
    if (
      taxiSummary.isSpecialNeedVehicle &&
      userModel.special_need_booking_inquiries_starts_at &&
      userModel.special_need_booking_inquiries_starts_at < now
    ) {
      return true;
    }

    return false;
  }
}

export const latestTaxiPositionMapper = new LatestTaxiPositionMapper();
