// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ModelMapCache } from "../shared/caching/modelMapCache";
import { TaxiSummaryModel } from "./taxiSummary.model";
import { taxiSummaryRepository } from "./taxiSummary.repository";

export const taxiSummaryRepositoryWithCaching =
  ModelMapCache.createFromMany<TaxiSummaryModel>((keys) =>
    taxiSummaryRepository.getTaxiSummaryByIds(keys)
  );
