// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ModelMapCache } from "../shared/caching/modelMapCache";
import { taxiDataAccessLayer } from "./taxi.dal";
import { TaxiResponseDto } from "./taxi.dto";

// Careful when using this cache not to leak more data than needed through the endpoints.
export const taxiDataAccessLayerWithCaching =
  ModelMapCache.createFromSingle<TaxiResponseDto>(
    async (key) => await taxiDataAccessLayer.getTaxiById(key),
  );
