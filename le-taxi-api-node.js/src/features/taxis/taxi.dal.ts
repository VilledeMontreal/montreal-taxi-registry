// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from 'pg';
import * as shortId from 'shortid';
import { TaxiStatus } from '../../libs/taxiStatus';
import { BadRequestError } from '../errorHandling/errors';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { DataOperation } from '../shared/dal/dal-operations.enum';
import { IDalResponse } from '../shared/dal/dal-response';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { IPaginationQueryParams, ISqlClauses } from '../shared/ui/pagination.interfaces';
import { UserModel } from '../users/user.model';
import { TaxiRequestDto, TaxiResponseDto } from './taxi.dto';

class TaxiDataAccessLayer {
  public async upsertTaxi(taxiDto: TaxiRequestDto, userModel: UserModel): Promise<IDalResponse> {
    const vehicleId: number = await this.tryGetVehicleId(taxiDto.vehicle.licence_plate, Number(userModel.id));
    const permitId: number = await this.tryGetPermitId(taxiDto.ads.insee, taxiDto.ads.numero, Number(userModel.id));
    const driverId: number = await this.tryGetDriverId(
      taxiDto.driver.departement,
      taxiDto.driver.professional_licence,
      Number(userModel.id)
    );

    const dalResponse = await this.createTaxiIfNotExists(
      vehicleId,
      permitId,
      driverId,
      Number(userModel.id),
      taxiDto.private
    );

    return dalResponse;
  }

  public async updateTaxiById(taxiId: string, isTaxiPrivate: boolean | string): Promise<number> {
    const existingTaxi = await this.findTaxi(taxiId);
    if (existingTaxi === null) {
      throw new BadRequestError(`No taxi with id '${taxiId}' found`);
    }

    const query = `
      UPDATE public.taxi
      SET private = $1::boolean, last_update_at = $2::timestamp without time zone
      WHERE id = $3::text
      RETURNING id
    `;

    const utcNow = new Date().toISOString();
    const queryResult = await postgrePool.query(query, [this.toBoolean(isTaxiPrivate), utcNow, taxiId]);

    return queryResult.rows[0].id;
  }

  public async getTaxiById(taxiId: string, userModel: UserModel = null): Promise<TaxiResponseDto> {
    const queryResult = await this.findTaxi(taxiId);
    if (queryResult === null) {
      throw new BadRequestError(`Unable to find a taxi with id '${taxiId}'`);
    }
    const taxiDataRow = queryResult.rows[0];
    if (userModel !== null && Number(userModel.id) !== taxiDataRow.added_by) {
      throw new BadRequestError(`Unable to find a taxi with id '${taxiId}' that was created by '${userModel.id}'`);
    }

    const [vehicleCharacteristics, latestTaxiPosition] = await Promise.all([
      this.getVehicleCharacteristics(taxiDataRow.vehicleDescriptionId),
      latestTaxiPositionRepository.getLatestTaxiPositionByTaxiId(taxiId)
    ]);

    const taxiResponseDto: TaxiResponseDto = {
      ads: {
        insee: taxiDataRow.insee,
        numero: taxiDataRow.numero
      },
      driver: {
        departement: taxiDataRow.departement,
        professional_licence: taxiDataRow.professional_licence
      },
      position: {
        lat: null,
        lon: null
      },
      vehicle: {
        characteristics: vehicleCharacteristics,
        color: taxiDataRow.color,
        constructor: taxiDataRow.manufacturer,
        licence_plate: taxiDataRow.licence_plate,
        model: taxiDataRow.model,
        nb_seats: taxiDataRow.nb_seats,
        type_: taxiDataRow.type_
      },
      crowfly_distance: null,
      id: taxiDataRow.id,
      last_update: latestTaxiPosition ? latestTaxiPosition.timestampUnixTime : null,
      operator: taxiDataRow.operator,
      private: taxiDataRow.private,
      rating: taxiDataRow.rating,
      status: latestTaxiPosition ? latestTaxiPosition.status : TaxiStatus.Off
    };

    return taxiResponseDto;
  }

  async getTaxisPaginated(queryParams: IPaginationQueryParams) {
    const { filterBy, orderBy, limitBy, values } = buildSqlClauses(queryParams);
    const query = `
      SELECT t.added_at,
        t.source,
        t.last_update_at,
        t.id,
        t.vehicle_id,
        t.ads_id,
        t.added_by,
        t.driver_id,
        t.rating,
        t.ban_begin,
        t.ban_end,
        t.private,
        a.numero,
        a.doublage,
        a.added_at as ads_added_at,
        a.added_by as ads_added_by,
        a.last_update_at as ads_last_update_at,
        a.insee,
        a.category,
        a.owner_name,
        a.owner_type,
        a.zupc_id,
        a.vdm_vignette,
        v.licence_plate,
        d.first_name,
        d.last_name,
        d.professional_licence,
        u.email as added_By_name
        FROM public.taxi t
        INNER JOIN public."ADS" a on t.ads_id = a.id
        LEFT OUTER JOIN public.vehicle v on t.vehicle_id = v.id
        LEFT OUTER JOIN public.driver d on t.driver_id = d.id
        LEFT OUTER JOIN public."user" u on u.id =  t.added_by
        WHERE TRUE ${filterBy} ORDER BY ${orderBy} ${limitBy}`;

    const queryResult = await postgrePool.query(query, values);
    return queryResult.rows;
  }

  async getTaxisCount(queryParams: IPaginationQueryParams) {
    const { filterBy, values } = buildSqlClauses(queryParams);
    const query = `SELECT
        COUNT(t.source) as count
        FROM public.taxi t
        INNER JOIN public."ADS" a on t.ads_id = a.id
        LEFT OUTER JOIN public.vehicle v on t.vehicle_id = v.id
        LEFT OUTER JOIN public.driver d on t.driver_id = d.id
        LEFT OUTER JOIN public."user" u on u.id = t.added_by
        WHERE TRUE ${filterBy}`;

    const queryResult = await postgrePool.query(query, values);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError('Unable to retrieve taxi count');
    }

    return queryResult.rows[0].count;
  }

  private async findTaxi(taxiId: string): Promise<QueryResult> {
    const query = `
      SELECT
        a.insee,
        a.numero,
        dp.numero AS departement,
        d.professional_licence,
        vd.color,
        vc.name AS manufacturer,
        v.licence_plate,
        vm.name AS model,
        vd.nb_seats,
        t.private,
        t.rating,
        t.id,
        t.last_update_at,
        t.added_by,
        u.email AS operator,
        vd.id AS "vehicleDescriptionId",
        vd.type_
      FROM public.taxi t
      INNER JOIN public.vehicle v ON t.vehicle_id = v.id
      INNER JOIN public.vehicle_description vd ON vd.vehicle_id = t.vehicle_id
      INNER JOIN public.model vm ON vd.model_id = vm.id
      INNER JOIN public.constructor vc ON vd.constructor_id = vc.id
      INNER JOIN public."ADS" a ON a.id = t.ads_id
      INNER JOIN public.driver d ON d.id = t.driver_id
      INNER JOIN public.user u ON u.id = t.added_by
      INNER JOIN public.departement dp ON dp.id = d.departement_id
      WHERE t.id=$1::text`;

    const queryResult: QueryResult = await postgrePool.query(query, [taxiId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }

    return queryResult;
  }

  private async getVehicleCharacteristics(vehicleDescriptionId: number): Promise<string[] | null> {
    const query = `
      SELECT *
      FROM public.vehicle_description
      WHERE id=$1::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [vehicleDescriptionId]);

    const items = queryResult.rows[0];
    const characteristics: string[] = [];

    for (const key in items) {
      if (typeof items[key] === 'boolean' && items[key]) {
        characteristics.push(key);
      }
    }

    if (characteristics.length === 0) {
      return null;
    }

    return characteristics;
  }
  private async tryGetVehicleId(licencePlate: string, userId: number): Promise<number> {
    const query = `
      SELECT v.id
      FROM public.vehicle v
      WHERE v.licence_plate=$1::text AND v.added_by_user=$2::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [licencePlate, userId]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError(
        `Unable to find a vehicle with licence plate '${licencePlate}' that was created by '${userId}'`
      );
    }

    return queryResult.rows[0].id;
  }

  private async tryGetPermitId(insee: string, numero: string, userId: number): Promise<number> {
    const query = `
      SELECT a.id
      FROM public."ADS" a
      WHERE a.insee=$1::text AND a.numero=$2::text AND a.added_by=$3::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [insee, numero, userId]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError(
        `Unable to find a permit with insee '${insee}' and number '${numero}' that was created by '${userId}'`
      );
    }

    return queryResult.rows[0].id;
  }

  private async tryGetDriverId(departement: string, professionalLicence: string, userId: number): Promise<number> {
    const query = `
      SELECT d.id
      FROM public.driver d
      WHERE d.departement_id=$1::int AND d.professional_licence=$2::text AND d.added_by=$3::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [departement, professionalLicence, userId]);

    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError(
        `Unable to find a driver with department '${departement}' and professional licence '${professionalLicence}' that was created by '${userId}'`
      );
    }

    return queryResult.rows[0].id;
  }

  private async createTaxiIfNotExists(
    vehicleId: number,
    permitId: number,
    driverId: number,
    userId: number,
    isTaxiPrivate: boolean
  ): Promise<IDalResponse> {
    const query = `
      SELECT *
      FROM public.taxi
      WHERE vehicle_id=$1::int AND ads_id=$2::int AND driver_id=$3::int AND added_by=$4::int
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [vehicleId, permitId, driverId, userId]);

    const doesTaxiExist = queryResult && queryResult.rows && queryResult.rows[0];
    const responseDal: IDalResponse = doesTaxiExist
      ? {
          entityId: await this.updateTaxiByVehiclePermitDriverOperatorCombination(
            vehicleId,
            permitId,
            driverId,
            userId,
            isTaxiPrivate
          ),
          dataOperation: DataOperation.Update
        }
      : {
          entityId: await this.insertTaxi(vehicleId, permitId, driverId, userId, isTaxiPrivate),
          dataOperation: DataOperation.Create
        };

    return responseDal;
  }

  // Cannot create unique constraint on the vehicle, ads, driver, operator combination,
  // because, we cannot ask all operators to resync their taxis.
  // We will have to live with the +/- 784 combinations with duplicated taxis created in the past.
  // In the future, new vehicle, ads, driver, operator combinations will be unique.
  public async updateTaxiByVehiclePermitDriverOperatorCombination(
    vehicleId: number,
    permitId: number,
    driverId: number,
    userId: number,
    isTaxiPrivate: boolean | string
  ): Promise<number> {
    const query = `
      UPDATE public.taxi
      SET private = $1::boolean, last_update_at = $2::timestamp without time zone
      WHERE vehicle_id=$3::int AND ads_id=$4::int AND driver_id=$5::int AND added_by=$6::int
      RETURNING id
    `;
    const utcNow = new Date().toISOString();
    const queryResult = await postgrePool.query(query, [
      this.toBoolean(isTaxiPrivate),
      utcNow,
      vehicleId,
      permitId,
      driverId,
      userId
    ]);

    return queryResult.rows[0].id;
  }

  private async insertTaxi(
    vehicleId: number,
    permitId: number,
    driverId: number,
    userId: number,
    privateKey: boolean
  ): Promise<string> {
    const query = `
      INSERT INTO
        public.taxi (
          added_at,
          added_via,
          source,
          last_update_at,
          vehicle_id,
          ads_id,
          added_by,
          driver_id,
          rating,
          ban_begin,
          ban_end,
          id,
          private
        )
        VALUES
          ($1::timestamp without time zone, $2::sources_taxi, $3::text, $4::timestamp without time zone, $5::int, $6::int, $7::int, $8::int, $9::double precision, $10::timestamp without time zone, $11::timestamp without time zone, $12::text, $13::boolean)
        RETURNING id
    `;

    const utcNow = new Date().toISOString();
    const queryResult = await postgrePool.query(query, [
      utcNow,
      'api',
      'added_by',
      utcNow,
      vehicleId,
      permitId,
      Number(userId),
      driverId,
      null,
      null,
      null,
      this.getShortId(),
      privateKey
    ]);

    return queryResult.rows[0].id;
  }

  private getShortId() {
    return shortId.generate();
  }

  public async getTaxiOperatorId(taxiId: string): Promise<number> {
    const query = `
    SELECT added_by
    FROM public.taxi
    WHERE id = $1::text`;
    const queryResult: QueryResult = await postgrePool.query(query, [taxiId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError(`taxi_id doesn't exists`);
    }
    const userId: number = queryResult.rows[0].added_by;
    return userId;
  }

  public async getTaxiRelationAndVignette(taxiId: string): Promise<any> {
    const query = `
    SELECT t.rating,
           t.ban_end,
           t.ban_begin,
           t.ads_id,
          (SELECT vdm_vignette FROM public."ADS" where id = t.ads_id ) as taxi_vignette
    FROM public.taxi t
    WHERE id = $1::text`;
    const queryResult: QueryResult = await postgrePool.query(query, [taxiId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      throw new BadRequestError(`taxi_id doesn't exists`);
    }
    return queryResult;
  }

  public async updateRatingTaxi(taxiId: string, totalRating: number): Promise<void> {
    const query = `
    UPDATE public.taxi
    SET last_update_at = $3::timestamp without time zone,
        rating = $2::double precision
    WHERE   id = $1::text`;
    await postgrePool.query(query, [taxiId, totalRating, new Date().toISOString()]);
  }

  private toBoolean(privateKey: string | boolean): boolean {
    if (typeof privateKey === 'boolean') {
      return privateKey;
    }
    if (privateKey === 'true') {
      return true;
    }
    return false;
  }
}

function buildSqlClauses(queryParams: IPaginationQueryParams): ISqlClauses {
  const filters = queryParams.filter?.split('|');
  let filterBy = '';
  let orderBy = '';
  let limitBy = '';
  const values = [];

  if (filters?.length >= 1) {
    filterBy += ` AND v.licence_plate ILIKE $1::text`;
    values.push(`%${filters[0]}%`);
  }

  if (filters?.length >= 2) {
    filterBy += ` AND u.email ILIKE $2::text`;
    values.push(`%${filters[1]}%`);
  }

  if (filters?.length >= 3) {
    filterBy += ` AND d.professional_licence ILIKE $3::text`;
    values.push(`%${filters[2]}%`);
  }

  if (filters?.length >= 4) {
    filterBy += ` AND a.vdm_vignette ILIKE $4::text`;
    values.push(`%${filters[3]}%`);
  }

  if (queryParams.operator) {
    filterBy += ` AND email = $${values.length + 1}::text`;
    values.push(queryParams.operator);
  }

  if (queryParams.page && queryParams.pageSize) {
    limitBy += ` LIMIT $${values.length + 2}::int OFFSET ($${values.length + 1}::int * $${values.length + 2}::int)`;
    values.push(queryParams.page, queryParams.pageSize);
  }

  orderBy += buildOrderByClause(queryParams.order);

  return { filterBy, orderBy, limitBy, values };
}

function buildOrderByClause(order: string): string {
  if (!order) return 'v.licence_plate';

  const column = order.includes('professional')
    ? 'd.professional_licence'
    : order.includes('first')
    ? 'd.first_name'
    : order.includes('last')
    ? 'd.last_name'
    : order.includes('vignette')
    ? 'a.vdm_vignette'
    : order.includes('email')
    ? 'u.email'
    : 'v.licence_plate';
  const descending = order.includes('desc') ? ' DESC' : '';

  return `${column} ${descending}`;
}

export const taxiDataAccessLayer = new TaxiDataAccessLayer();
