// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as _ from "lodash";
import { QueryResult } from "pg";
import { ModelMap } from "../shared/caching/modelMap";
import { postgrePool } from "../shared/taxiPostgre/taxiPostgre";
import { TaxiSummaryModel } from "./taxiSummary.model";

export class TaxiSummaryRepository {
  public async getTaxiSummaryByIds(
    ids: string[]
  ): Promise<ModelMap<TaxiSummaryModel>> {
    const query = `
    SELECT t.id "id",
      vd.special_need_vehicle "isSpecialNeedVehicle",
      vd.type_ "typeUnderscore",
      t.added_by "operatorId",
      u.public_id "operatorPublicId",
      vd.type_ = 'mpv' "isMpv"
    FROM taxi t
    INNER JOIN public."user" u on u.id = t.added_by
    INNER JOIN vehicle_description vd on vd.vehicle_id = t.vehicle_id, unnest($1::text[]) w(idWanted)
    WHERE t.id = w.idWanted
    `;
    const queryResult: QueryResult<TaxiSummaryModel> = await postgrePool.query(
      query,
      [ids]
    );

    return _.keyBy(queryResult?.rows, "id");
  }
}

export const taxiSummaryRepository: TaxiSummaryRepository =
  new TaxiSummaryRepository();
