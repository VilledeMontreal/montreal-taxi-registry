// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from "pg";
import { BadRequestError } from "../errorHandling/errors";
import { DataOperation } from "../shared/dal/dal-operations.enum";
import { IDalResponse } from "../shared/dal/dal-response";
import { postgrePool } from "../shared/taxiPostgre/taxiPostgre";
import {
  IPaginationQueryParams,
  ISqlClauses,
} from "../shared/ui/pagination.interfaces";
import { UserModel } from "../users/user.model";
import { VehicleRequestDto, VehicleResponseDto } from "./vehicle.dto";

class VehicleDataAccessLayer {
  public async upsertVehicle(
    vehicleDto: VehicleRequestDto,
    userModel: UserModel
  ): Promise<IDalResponse> {
    const persistedVehicleId: number = await this.tryCreateVehicleIfNotExists(
      vehicleDto.licence_plate,
      Number(userModel.id)
    );
    const persistedModelId: number = vehicleDto.model
      ? await this.createModelIfNotExists(vehicleDto.model)
      : await this.getModelIdByVehicleId(persistedVehicleId);

    const persistedConstructorId: number = vehicleDto.manufacturer
      ? await this.createConstructorIfNotExists(vehicleDto.manufacturer)
      : await this.getConstructorIdByVehicleId(persistedVehicleId);

    const dalResponse = await this.upsertVehicleDescription(
      vehicleDto,
      userModel,
      persistedModelId,
      persistedConstructorId,
      persistedVehicleId
    );

    dalResponse.entityId = persistedVehicleId;
    return dalResponse;
  }

  public async getVehicleById(
    vehicleId: string,
    operator?: string
  ): Promise<VehicleResponseDto> {
    const select = `
      SELECT
        vd.air_con,
        vd.amex_accepted,
        vd.baby_seat,
        vd.bank_check_accepted,
        vd.bike_accepted,
        vd.bonjour,
        vd.color,
        vc.name AS constructor,
        vd.cpam_conventionne,
        vd.credit_card_accepted,
        vd.date_dernier_ct,
        vd.date_validite_ct,
        vd.dvd_player,
        vd.electronic_toll,
        vd.engine,
        vd.every_destination,
        vd.fresh_drink,
        vd.gps,
        vd.horodateur,
        vd.horse_power,
        v.id,
        v.licence_plate,
        vd.luxury,
        vm.name AS model,
        vd.model_year,
        vd.nb_seats,
        vd.nfc_cc_accepted,
        vd.pet_accepted,
        vd.relais,
        vd.special_need_vehicle,
        vd.tablet,
        vd.taximetre,
        vd.type_,
        vd.wifi,
        vd.vehicle_identification_number
      FROM public.vehicle v
      INNER JOIN public.vehicle_description vd ON vd.vehicle_id = v.id
      INNER JOIN public.model vm ON vd.model_id = vm.id
      INNER JOIN public.constructor vc ON vd.constructor_id = vc.id
      INNER JOIN public."user" u on u.id = vd.added_by
      WHERE v.id=$1::int
    `;
    const query = operator ? `${select} AND u.email = $2::text` : select;
    const params = operator ? [vehicleId, operator] : [vehicleId];
    const queryResult: QueryResult = await postgrePool.query(query, params);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }

    const readVehicleDto: VehicleResponseDto = queryResult.rows[0];
    return readVehicleDto;
  }

  async getVehiclesPaginated(queryParams: IPaginationQueryParams) {
    const { filterBy, orderBy, limitBy, values } = buildSqlClauses(queryParams);
    const query = `
      SELECT
        v.licence_plate,
        vd.added_at,
        vd.added_via,
        vd.source,
        vd.last_update_at,
        vd.id,
        vd.model_id,
        vd.constructor_id,
        vd.model_year,
        vd.engine,
        vd.horse_power,
        vd.relais,
        vd.horodateur,
        vd.taximetre,
        vd.date_dernier_ct,
        vd.date_validite_ct,
        vd.special_need_vehicle,
        vd.type_,
        vd.luxury,
        vd.credit_card_accepted,
        vd.nfc_cc_accepted,
        vd.amex_accepted,
        vd.bank_check_accepted,
        vd.fresh_drink,
        vd.dvd_player,
        vd.tablet,
        vd.wifi,
        vd.baby_seat,
        vd.bike_accepted,
        vd.pet_accepted,
        vd.air_con,
        vd.bonjour,
        vd.electronic_toll,
        vd.gps,
        vd.cpam_conventionne,
        vd.every_destination,
        vd.color,
        vd.vehicle_id,
        vd.added_by,
        vd.nb_seats,
        vd."last_nonStatus_update_at",
        vd.vehicle_identification_number,
        vm.name as modelName,
        vc.name as constructorName,
        u.email as added_By_name
      FROM public.vehicle v
      INNER JOIN public.vehicle_description vd ON vd.vehicle_id = v.id
      INNER JOIN public.model vm ON vd.model_id = vm.id
      INNER JOIN public.constructor vc ON vd.constructor_id = vc.id
      INNER JOIN public."user" u on u.id = vd.added_by
      WHERE TRUE ${filterBy} ORDER BY ${orderBy} ${limitBy}`;

    const queryResult = await postgrePool.query(query, values);
    return queryResult.rows;
  }

  async getVehiclesCount(queryParams: IPaginationQueryParams) {
    const { filterBy, values } = buildSqlClauses(queryParams);
    const query = `
      SELECT count(v.id) as count
        FROM public.vehicle_description vd
        INNER JOIN public.vehicle v on v.id = vd.vehicle_id
        INNER JOIN public.model vm on vm.id = vd.model_id
        INNER JOIN public.constructor vc on vc.id = vd.constructor_id
        INNER JOIN public."user" u on u.id = vd.added_by
        WHERE TRUE ${filterBy}`;

    const queryResult = await postgrePool.query(query, values);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError("Unable to retrieve vehicle count");
    }

    return queryResult.rows[0].count;
  }

  private async tryCreateVehicleIfNotExists(
    licencePlate: string,
    userId: number
  ): Promise<number> {
    let query = `
      SELECT v.id
      FROM public.vehicle v
      WHERE v.licence_plate=$1::text AND v.added_by_user=$2::int
    `;
    let queryResult: QueryResult = await postgrePool.query(query, [
      licencePlate,
      userId,
    ]);

    if (queryResult.rowCount === 1) {
      return queryResult.rows[0].id;
    }

    if (queryResult.rowCount > 1) {
      throw new BadRequestError(
        `More than one vehicle was found with licence plate '${licencePlate}'`
      );
    }

    query = `
      INSERT INTO public.vehicle(licence_plate, added_by_user)
      VALUES ($1::text, $2::int)
      RETURNING id
    `;
    queryResult = await postgrePool.query(query, [licencePlate, userId]);

    return queryResult.rows[0].id;
  }

  private async createModelIfNotExists(modelName: string): Promise<number> {
    if (!modelName) {
      return null;
    }

    let query = `
      SELECT id
      FROM public.model AS m
      WHERE m.name=$1::text
    `;
    let queryResult: QueryResult = await postgrePool.query(query, [modelName]);

    if (queryResult.rowCount === 1) {
      return queryResult.rows[0].id;
    }

    query = `
      INSERT INTO public.model(name)
      VALUES ($1::text)
      RETURNING id
    `;
    queryResult = await postgrePool.query(query, [modelName]);

    return queryResult.rows[0].id;
  }

  private async createConstructorIfNotExists(
    manufacturerName: string
  ): Promise<number> {
    if (!manufacturerName) {
      return null;
    }

    let query = `
      SELECT id
      FROM public.constructor AS c
      WHERE c.name=$1::text
    `;
    let queryResult: QueryResult = await postgrePool.query(query, [
      manufacturerName,
    ]);

    if (queryResult.rowCount === 1) {
      return queryResult.rows[0].id;
    }

    query = `
      INSERT INTO public.constructor(name)
      VALUES ($1::text)
      RETURNING id
    `;
    queryResult = await postgrePool.query(query, [manufacturerName]);

    return queryResult.rows[0].id;
  }

  private async upsertVehicleDescription(
    vehicleDto: VehicleRequestDto,
    userModel: UserModel,
    modelId: number,
    constructorId: number,
    vehicleId: number
  ): Promise<IDalResponse> {
    const query = `
      SELECT *
      FROM public.vehicle_description
      WHERE vehicle_id=$1::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [
      vehicleId,
    ]);

    let foundVehicleDescription = true;
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      foundVehicleDescription = false;
    }

    const vehicleDescriptionId: number = foundVehicleDescription
      ? await this.updateVehicleDescription(
          vehicleId,
          modelId,
          constructorId,
          queryResult.rows,
          vehicleDto
        )
      : await this.insertVehicleDescription(
          vehicleId,
          modelId,
          constructorId,
          vehicleDto,
          userModel
        );

    const responseDal: IDalResponse = foundVehicleDescription
      ? {
          entityId: vehicleDescriptionId,
          dataOperation: DataOperation.Update,
        }
      : {
          entityId: vehicleDescriptionId,
          dataOperation: DataOperation.Create,
        };

    return responseDal;
  }

  private async insertVehicleDescription(
    vehicleId: number,
    modelId: number,
    constructorId: number,
    vehicleRequestDto: VehicleRequestDto,
    userModel: UserModel
  ): Promise<number> {
    const query = `
      INSERT INTO
        public.vehicle_description (
          added_at,
          added_by,
          added_via,
          air_con,
          amex_accepted,
          baby_seat,
          bank_check_accepted,
          bike_accepted,
          color,
          constructor_id,
          cpam_conventionne,
          credit_card_accepted,
          date_dernier_ct,
          date_validite_ct,
          dvd_player,
          electronic_toll,
          engine,
          every_destination,
          fresh_drink,
          gps,
          horodateur,
          horse_power,
          "last_nonStatus_update_at",
          last_update_at,
          luxury,
          model_id,
          model_year,
          nb_seats,
          nfc_cc_accepted,
          pet_accepted,
          relais,
          source,
          special_need_vehicle,
          tablet,
          taximetre,
          type_,
          vehicle_id,
          wifi,
          vehicle_identification_number,
          bonjour
        )
      VALUES
        ($1::timestamp without time zone, $2::int, $3::sources, $4::boolean, $5::boolean, $6::boolean, $7::boolean, $8::boolean, $9::text, $10::int, $11::boolean, $12::boolean, $13::date, $14::date, $15::boolean, $16::boolean, $17::text, $18::boolean, $19::boolean, $20::boolean, $21::text, $22::float, $23::timestamp without time zone, $24::timestamp without time zone, $25::boolean, $26::int, $27::int, $28::int, $29::boolean, $30::boolean, $31::boolean, $32::text, $33::boolean, $34::boolean, $35::text, $36::vehicle_enum, $37::int, $38::boolean, $39::text, $40::boolean)
      RETURNING id
    `;

    const queryResult = await postgrePool.query(query, [
      new Date().toISOString(),
      userModel.id,
      "api",
      vehicleRequestDto.air_con,
      vehicleRequestDto.amex_accepted,
      vehicleRequestDto.baby_seat,
      vehicleRequestDto.bank_check_accepted,
      vehicleRequestDto.bike_accepted,
      vehicleRequestDto.color,
      constructorId,
      vehicleRequestDto.cpam_conventionne,
      vehicleRequestDto.credit_card_accepted,
      vehicleRequestDto.date_dernier_ct,
      vehicleRequestDto.date_validite_ct,
      vehicleRequestDto.dvd_player,
      vehicleRequestDto.electronic_toll,
      vehicleRequestDto.engine,
      vehicleRequestDto.every_destination,
      vehicleRequestDto.fresh_drink,
      vehicleRequestDto.gps,
      vehicleRequestDto.horodateur,
      vehicleRequestDto.horse_power,
      null,
      null,
      vehicleRequestDto.luxury,
      modelId,
      vehicleRequestDto.model_year,
      vehicleRequestDto.nb_seats,
      vehicleRequestDto.nfc_cc_accepted,
      vehicleRequestDto.pet_accepted,
      vehicleRequestDto.relais,
      "added_by",
      vehicleRequestDto.special_need_vehicle,
      vehicleRequestDto.tablet,
      vehicleRequestDto.taximetre,
      vehicleRequestDto.type_,
      vehicleId,
      vehicleRequestDto.wifi,
      vehicleRequestDto.vehicle_identification_number,
      vehicleRequestDto.bonjour,
    ]);

    return queryResult.rows[0].id;
  }

  private async updateVehicleDescription(
    vehicleId: number,
    modelId: number,
    constructorId: number,
    foundVehicleDescription: QueryResult["rows"],
    vehicleRequestDto: VehicleRequestDto
  ): Promise<number> {
    const keys = Object.keys(foundVehicleDescription[0]);
    keys.forEach((key) => {
      if (typeof vehicleRequestDto[key] === "undefined") {
        vehicleRequestDto[key] = foundVehicleDescription[0][key];
      }
    });

    if (!modelId) {
      modelId = foundVehicleDescription[0].model_id;
    }
    if (!constructorId) {
      constructorId = foundVehicleDescription[0].constructor_id;
    }

    const query = `
        UPDATE
          public.vehicle_description
        SET
          air_con = $1::boolean,
          amex_accepted = $2::boolean,
          baby_seat = $3::boolean,
          bank_check_accepted = $4::boolean,
          bike_accepted = $5::boolean,
          color = $6::text,
          constructor_id = $7::int,
          cpam_conventionne = $8::boolean,
          credit_card_accepted = $9::boolean,
          date_dernier_ct = $10::date,
          date_validite_ct = $11::date,
          dvd_player = $12::boolean,
          electronic_toll = $13::boolean,
          engine = $14::text,
          every_destination = $15::boolean,
          fresh_drink = $16::boolean,
          gps = $17::boolean,
          horodateur = $18::text,
          horse_power = $19::float,
          "last_nonStatus_update_at" = $20::timestamp without time zone,
          last_update_at = $21::timestamp without time zone,
          luxury = $22::boolean,
          model_id = $23::int,
          model_year = $24::int,
          nb_seats = $25::int,
          nfc_cc_accepted = $26::boolean,
          pet_accepted = $27::boolean,
          relais = $28::boolean,
          special_need_vehicle = $29::boolean,
          tablet = $30::boolean,
          taximetre = $31::text,
          type_ = $32::vehicle_enum,
          wifi = $33::boolean,
          vehicle_identification_number = $34::text,
          bonjour = $35::boolean
        WHERE vehicle_id = $36::int
        RETURNING id
      `;
    const now = new Date().toISOString();
    const queryResult = await postgrePool.query(query, [
      vehicleRequestDto.air_con,
      vehicleRequestDto.amex_accepted,
      vehicleRequestDto.baby_seat,
      vehicleRequestDto.bank_check_accepted,
      vehicleRequestDto.bike_accepted,
      vehicleRequestDto.color,
      constructorId,
      vehicleRequestDto.cpam_conventionne,
      vehicleRequestDto.credit_card_accepted,
      vehicleRequestDto.date_dernier_ct,
      vehicleRequestDto.date_validite_ct,
      vehicleRequestDto.dvd_player,
      vehicleRequestDto.electronic_toll,
      vehicleRequestDto.engine,
      vehicleRequestDto.every_destination,
      vehicleRequestDto.fresh_drink,
      vehicleRequestDto.gps,
      vehicleRequestDto.horodateur,
      vehicleRequestDto.horse_power,
      now,
      now,
      vehicleRequestDto.luxury,
      modelId,
      vehicleRequestDto.model_year,
      vehicleRequestDto.nb_seats,
      vehicleRequestDto.nfc_cc_accepted,
      vehicleRequestDto.pet_accepted,
      vehicleRequestDto.relais,
      vehicleRequestDto.special_need_vehicle,
      vehicleRequestDto.tablet,
      vehicleRequestDto.taximetre,
      vehicleRequestDto.type_,
      vehicleRequestDto.wifi,
      vehicleRequestDto.vehicle_identification_number,
      vehicleRequestDto.bonjour,
      vehicleId,
    ]);

    return queryResult.rows[0].id;
  }

  private async getModelIdByVehicleId(vehicleId: number): Promise<number> {
    const query = `
      SELECT model_id
      FROM public.vehicle_description
      WHERE vehicle_id=$1::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [
      vehicleId,
    ]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    return queryResult.rows[0].model_id;
  }

  private async getConstructorIdByVehicleId(
    vehicleId: number
  ): Promise<number> {
    const query = `
      SELECT constructor_id
      FROM public.vehicle_description
      WHERE vehicle_id=$1::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [
      vehicleId,
    ]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    return queryResult.rows[0].constructor_id;
  }
}

function buildSqlClauses(queryParams: IPaginationQueryParams): ISqlClauses {
  const filters = queryParams.filter?.split("|");
  let filterBy = "";
  let orderBy = "";
  let limitBy = "";
  const values = [];

  if (filters?.length >= 1) {
    filterBy += ` AND v.licence_plate ILIKE $1::text`;
    values.push(`%${filters[0]}%`);
  }

  if (filters?.length >= 2) {
    filterBy += ` AND u.email ILIKE $2::text`;
    values.push(`%${filters[1]}%`);
  }

  if (queryParams.operator) {
    filterBy += ` AND u.email = $${values.length + 1}::text`;
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
  if (!order) return "v.licence_plate";

  const column = order.includes("email") ? "u.email" : "v.licence_plate";
  const descending = order.includes("desc") ? " DESC" : "";

  return `${column} ${descending}`;
}

export const vehicleDataAccessLayer = new VehicleDataAccessLayer();
