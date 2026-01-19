// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from "pg";
import { BadRequestError } from "../errorHandling/errors";
import { postgrePool } from "../shared/taxiPostgre/taxiPostgre";

class DepartmentDataAccessLayer {
  public async getDepartmentId(departementNumero: string): Promise<number> {
    const query = `
      SELECT id
      FROM public.departement
      WHERE numero = $1::text`;
    const queryResult: QueryResult = await postgrePool.query(query, [
      departementNumero,
    ]);
    if (
      !queryResult ||
      !queryResult.rows ||
      !queryResult.rows[0] ||
      !queryResult.rows[0].id
    ) {
      throw new BadRequestError(
        `Department with number '${departementNumero}' was not found. Either make sure the department exists or use the default department number '1000' instead.`,
      );
    }
    return queryResult.rows[0].id;
  }
}

export const departmentDataAccessLayer = new DepartmentDataAccessLayer();
