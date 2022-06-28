// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class TaxiPositionSnapshotItemRequestDto {
  public operator: string;
  public taxi: string;
  public lat: string;
  public lon: string;
  public device: string;
  public status: string;
  public version: string;
  public timestamp: string;
  public speed: number;
  public azimuth: number;
}
