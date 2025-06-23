// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TaxiPositionSnapshotItemRequestDto } from "./taxiPositionSnapshotItemRequest.dto";

export class TaxiPositionSnapshotRequestDto {
  public items: TaxiPositionSnapshotItemRequestDto[];
  public receivedAt?: Date;
}
