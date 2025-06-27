// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from "pg";
import { departmentDataAccessLayer } from "../departments/department.dal";
import { BadRequestError } from "../errorHandling/errors";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { IDalResponse } from "../shared/dal/dal-response";
import { postgrePool } from "../shared/taxiPostgre/taxiPostgre";
import {
  IPaginationQueryParams,
  ISqlClauses,
} from "../shared/ui/pagination.interfaces";
import { EntityVerificationResult } from "../shared/validations/EntityVerificationResult";
import { UserModel } from "../users/user.model";
import { DriverRequestDto, DriverResponseDto } from "./driver.dto";

class DriverDataAccessLayer {
  public async upsertDriver(
    driver: DriverRequestDto,
    user: UserModel
  ): Promise<IDalResponse> {
    const departmentId = await departmentDataAccessLayer.getDepartmentId(
      driver.departement.numero
    );
    const driverVerificationResult = await this.verifyIfDriverExists(
      driver.professional_licence,
      departmentId,
      user.id
    );
    const persistedDriverId: IDalResponse =
      driverVerificationResult.entityExists
        ? await this.updateDriver(
            driverVerificationResult.entityId,
            driver,
            user.id
          )
        : await this.insertDriver(driver, departmentId, user.id);
    return persistedDriverId;
  }

  public async getDriverById(
    driverId: string,
    operator?: string
  ): Promise<DriverResponseDto> {
    const select = `
        SELECT driver.id as driver_id,
               birth_date as driver_birthdate,
               dept.id as departement_id,
               dept.numero as departement_numero,
               dept.nom as departement_nom,
               first_name as driver_firstname,
               last_name as driver_lastname,
               professional_licence as driver_professional_licence
        FROM public.driver driver
        INNER JOIN public.departement dept ON (driver.departement_id = dept.id)
        WHERE driver.id = $1::int`;

    const query = operator ? `${select} AND email = $2::text` : select;
    const params = operator ? [driverId, operator] : [driverId];
    const queryResult: QueryResult = await postgrePool.query(query, params);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    const driverDataRow: any = queryResult.rows[0];
    const driverResponseDto: DriverResponseDto = {
      birth_date: driverDataRow.driver_birthdate,
      departement: {
        nom: driverDataRow.departement_nom,
        numero: driverDataRow.departement_numero,
      },
      first_name: driverDataRow.driver_firstname,
      last_name: driverDataRow.driver_lastname,
      professional_licence: driverDataRow.driver_professional_licence,
    };
    return driverResponseDto;
  }

  async getDriversPaginated(queryParams: IPaginationQueryParams) {
    const { filterBy, orderBy, limitBy, values } = buildSqlClauses(queryParams);
    const query = `
      SELECT public.driver.added_at,
        public.driver.added_via,
        public.driver.source,
        public.driver.last_update_at,
        public.driver.id,
        public.driver.departement_id,
        public.driver.added_by,
        public.driver.first_name,
        public.driver.last_name,
        public.driver.professional_licence,
        "user".email as added_By_name
        FROM public.driver left join public."user" on public.driver.added_by = public."user".id
        WHERE TRUE ${filterBy} ORDER BY ${orderBy} ${limitBy}`;

    const queryResult = await postgrePool.query(query, values);
    return queryResult.rows;
  }

  async getDriversCount(queryParams: IPaginationQueryParams) {
    const { filterBy, values } = buildSqlClauses(queryParams);
    const query = `SELECT count(public.driver.id) as count
        FROM public.driver left join public."user" on public.driver.added_by = public."user".id
        WHERE TRUE ${filterBy}`;

    const queryResult = await postgrePool.query(query, values);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError("Unable to retrieve driver count");
    }

    return queryResult.rows[0].count;
  }

  private async verifyIfDriverExists(
    professionalLicense: string,
    departmentId: number,
    userId: string
  ): Promise<EntityVerificationResult> {
    const query = `
      SELECT driver.id
      FROM public.driver
      INNER JOIN public.departement dept ON driver.departement_id = dept.id
      WHERE professional_licence = $1::text AND dept.id = $2::int AND added_by = $3::int`;
    const queryResult: QueryResult = await postgrePool.query(query, [
      professionalLicense,
      departmentId,
      userId,
    ]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return EntityVerificationResult.notFound();
    }
    return EntityVerificationResult.found(queryResult.rows[0].id);
  }

  private async updateDriver(
    driverId: number,
    driver: DriverRequestDto,
    userId: string
  ): Promise<IDalResponse> {
    // NOTE: According the API documentation, we currently ignore the birth date in Quebec for privacy reason.
    const query = `
      UPDATE public.driver
      SET
        first_name = $3::text,
        last_name = $4::text,
        last_update_at = $5::timestamp without time zone
      WHERE public.driver.id = $1::int
      AND public.driver.added_by = $2::int
      RETURNING id`;
    const queryResult: QueryResult = await postgrePool.query(query, [
      driverId,
      userId,
      driver.first_name,
      driver.last_name,
      new Date().toISOString(),
    ]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }

    const responseDal: IDalResponse = {
      entityId: queryResult.rows[0].id,
      dataOperation: DataOperation.Update,
    };
    return responseDal;
  }

  private async insertDriver(
    driver: DriverRequestDto,
    departmentId: number,
    userId: string
  ): Promise<IDalResponse> {
    const query = `
      INSERT INTO public.driver(added_via,
                                source,
                                birth_date,
                                departement_id,
                                first_name,
                                last_name,
                                professional_licence,
                                added_at,
                                added_by)
      VALUES ($1::sources_driver, $2::text, $3::date, $4::int, $5::text, $6::text, $7::text, $8::timestamp without time zone, $9::int)
      RETURNING id`;
    const queryResult: QueryResult = await postgrePool.query(query, [
      "api",
      "added_by",
      null, // NOTE: According the API documentation, we currently ignore the birth date in Quebec for privacy reason.
      departmentId,
      driver.first_name,
      driver.last_name,
      driver.professional_licence,
      new Date().toISOString(),
      userId,
    ]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    const insertedDriverId = queryResult.rows[0].id;

    const responseDal: IDalResponse = {
      entityId: insertedDriverId,
      dataOperation: DataOperation.Create,
    };

    return responseDal;
  }
}

function buildSqlClauses(queryParams: IPaginationQueryParams): ISqlClauses {
  const filters = queryParams.filter?.split("|");
  let filterBy = "";
  let orderBy = "";
  let limitBy = "";
  const values = [];

  if (filters?.length >= 1) {
    filterBy += ` AND professional_licence ILIKE $1::text`;
    values.push(`%${filters[0]}%`);
  }

  if (filters?.length >= 2) {
    filterBy += ` AND last_name ILIKE $2::text`;
    values.push(`%${filters[1]}%`);
  }

  if (filters?.length >= 3) {
    filterBy += ` AND first_name ILIKE $3::text`;
    values.push(`%${filters[2]}%`);
  }

  if (filters?.length >= 4) {
    filterBy += ` AND email ILIKE $4::text`;
    values.push(`%${filters[3]}%`);
  }

  if (queryParams.operator) {
    filterBy += ` AND email = $${values.length + 1}::text`;
    values.push(queryParams.operator);
  }

  if (queryParams.page && queryParams.pageSize) {
    limitBy += ` LIMIT $${values.length + 2}::int OFFSET ($${
      values.length + 1
    }::int * $${values.length + 2}::int)`;
    values.push(queryParams.page, queryParams.pageSize);
  }

  orderBy += buildOrderByClause(queryParams.order);

  return { filterBy, orderBy, limitBy, values };
}

function buildOrderByClause(order: string): string {
  if (!order) return "public.driver.professional_licence";

  const column = order.includes("last")
    ? "public.driver.last_name"
    : order.includes("first")
    ? "public.driver.first_name"
    : order.includes("update")
    ? "public.driver.last_update_at"
    : order.includes("email")
    ? 'public."user".email'
    : "public.driver.professional_licence";
  const descending = order.includes("desc") ? " DESC" : "";

  return `${column} ${descending}`;
}

export const driverDataAccessLayer = new DriverDataAccessLayer();
