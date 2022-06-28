// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TaxiResponseDto } from './taxi.dto';

class TaxiMapper {
  public anonymizeTaxi(taxi: TaxiResponseDto): Partial<TaxiResponseDto> {
    const anonymizedTaxi = Object.assign({}, taxi);

    delete anonymizedTaxi.ads;
    delete anonymizedTaxi.driver;
    delete anonymizedTaxi.vehicle.licence_plate;
    delete anonymizedTaxi.private;
    delete anonymizedTaxi.status;

    return anonymizedTaxi;
  }
}

export const taxiMapper = new TaxiMapper();
