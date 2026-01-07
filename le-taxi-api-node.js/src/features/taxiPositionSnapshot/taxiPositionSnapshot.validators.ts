// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError, MultipleIssuesError } from "../errorHandling/errors";
import {
  isLatitudeValid,
  isLongitudeValid,
  isNumber,
} from "../shared/validations/validators";
import { taxiSummaryRepositoryWithCaching } from "../taxiSummaries/taxiSummary.repositoryWithCaching";
import { UserModel } from "../users/user.model";
import { TaxiStatus } from "./../../libs/taxiStatus";
import { TaxiPositionSnapshotItemRequestDto } from "./taxiPositionSnapshotItemRequest.dto";
import { TaxiPositionSnapshotRequestDto } from "./taxiPositionSnapshotRequest.dto";

export function validateTaxiPositionSnapshot(
  taxiPositionSnapshot: any,
  currentUser: UserModel,
): void {
  const validationErrorMessages: string[] = [];
  const isInvalidSnapshotJsonFormat =
    !taxiPositionSnapshot ||
    !Array.isArray(taxiPositionSnapshot.items) ||
    taxiPositionSnapshot.items.length === 0;
  if (isInvalidSnapshotJsonFormat) {
    validationErrorMessages.push(
      "the taxi position snapshot is not in a valid JSON format",
    );
  } else {
    taxiPositionSnapshot.items.forEach((snapshot: any) => {
      validationErrorMessages.push(
        ...validateTaxiPositionSnapShotItem(snapshot, currentUser),
      );
    });
  }
  if (validationErrorMessages.length) {
    throw validationErrorMessages.length === 1
      ? new BadRequestError(
          `The validation failed for this taxi position snapshot because: ${validationErrorMessages[0]}.`,
        )
      : new MultipleIssuesError(
          "Multiple validation errors were found for this taxi position snapshot.",
          validationErrorMessages,
        );
  }
}

function validateTaxiPositionSnapShotItem(
  snapshotItem: TaxiPositionSnapshotItemRequestDto,
  currentUser: UserModel,
): string[] {
  const validationErrorMessages: string[] = [];
  if (!hasValidOperator(snapshotItem.operator, currentUser)) {
    validationErrorMessages.push(
      "the operator is either missing or has an invalid API key",
    );
  }
  if (!snapshotItem.taxi) {
    validationErrorMessages.push("the taxi identifier is missing");
  }
  if (!isNumber(snapshotItem.lat)) {
    validationErrorMessages.push("the latitude is not valid");
  }
  if (!isLatitudeValid(Number.parseFloat(snapshotItem.lat))) {
    validationErrorMessages.push("the latitude is out of bounds");
  }
  if (!isNumber(snapshotItem.lon)) {
    validationErrorMessages.push("the longitude is not valid");
  }
  if (!isLongitudeValid(Number.parseFloat(snapshotItem.lon))) {
    validationErrorMessages.push("the longitude is out of bounds");
  }
  if (!snapshotItem.device) {
    validationErrorMessages.push("the device is not valid");
  }
  if (!isStatusValid(snapshotItem.status)) {
    validationErrorMessages.push("the status is not valid");
  }
  if (!isVersionValid(snapshotItem.version)) {
    validationErrorMessages.push("the version is not valid");
  }
  if (!isTimestampValid(snapshotItem.timestamp)) {
    validationErrorMessages.push(
      "the timestamp must be in a valid UTC format, no older than a minute from the time the request was sent and not set in the future",
    );
  }
  if (!snapshotItem.speed || isNaN(snapshotItem.speed)) {
    validationErrorMessages.push(
      "the speed attribute is mandatory and must be a number",
    );
  }
  if (!isNumber(snapshotItem.azimuth)) {
    validationErrorMessages.push("the azimuth is not valid");
  }
  if (!isAzimuthValid(snapshotItem.azimuth)) {
    validationErrorMessages.push("the azimuth is out of bounds");
  }
  snapshotItem.azimuth = handle360Azimuth(snapshotItem.azimuth);

  return validationErrorMessages;
}

export async function validateTaxiOwnership(
  taxiPositionSnapshot: TaxiPositionSnapshotRequestDto,
  operatorId: string,
) {
  const taxiSummaries = await taxiSummaryRepositoryWithCaching.getByKeys(
    taxiPositionSnapshot.items.map((item) => item.taxi),
  );
  const hasUnknownTaxi = taxiPositionSnapshot.items.some(
    (snapshot) => taxiSummaries && !taxiSummaries[snapshot.taxi],
  );
  if (hasUnknownTaxi) {
    throw new BadRequestError(
      `The validation failed for this taxi position snapshot because: some taxis are not existing in the system`,
    );
  }

  const hasWrongOwner = taxiPositionSnapshot.items.some(
    (snapshot) =>
      taxiSummaries &&
      taxiSummaries[snapshot.taxi] &&
      taxiSummaries[snapshot.taxi].operatorId !== operatorId,
  );
  if (hasWrongOwner) {
    throw new BadRequestError(
      `The validation failed for this taxi position snapshot because: some taxis do not belong to the operator`,
    );
  }
}

function isAzimuthValid(azimuth: number): boolean {
  return isNumber(azimuth) && azimuth >= 0 && azimuth <= 360;
}

function handle360Azimuth(azimuth: any): number {
  return azimuth === 360 || azimuth === "360" ? 0 : azimuth;
}

function hasValidOperator(operator: string, user: UserModel) {
  return user && operator && operator === user.email;
}

function isStatusValid(status: any): boolean {
  return !!status && Object.values(TaxiStatus).includes(status);
}

function isVersionValid(version: any): boolean {
  const CURRENT_API_VERSION = 2;
  return !!version && parseFloat(version) === CURRENT_API_VERSION;
}

function isTimestampValid(timestamp: any): boolean {
  const ONE_MINUTE = 1 * 60;
  const currentTimeInSeconds = parseInt(`${new Date().getTime() / 1000}`, 10);
  return (
    new Date(Number(timestamp)).getTime() > 0 &&
    currentTimeInSeconds - timestamp <= ONE_MINUTE &&
    timestamp <= currentTimeInSeconds + ONE_MINUTE
  );
}
