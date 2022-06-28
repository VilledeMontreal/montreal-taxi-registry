// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from 'pg';
import { BadRequestError } from '../errorHandling/errors';
import { DataOperation } from '../shared/dal/dal-operations.enum';
import { IDalResponse } from '../shared/dal/dal-response';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { UserModel } from '../users/user.model';
import { AdsRequestDto, AdsResponseDto } from './ads.dto';

class AdsDataAccessLayer {
  public async upsertAds(adsRequestDto: AdsRequestDto, userModel: UserModel): Promise<IDalResponse> {
    const query = `
      SELECT *
      FROM public."ADS"
      WHERE insee=$1::text AND numero=$2::text AND added_by=$3
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [
      adsRequestDto.insee,
      adsRequestDto.numero,
      Number(userModel.id)
    ]);

    let foundAds = true;
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      foundAds = false;
    }

    const persistedAdsId: number = foundAds
      ? await this.tryUpdateAds(queryResult.rows[0].id, queryResult.rows[0], adsRequestDto)
      : await this.tryInsertAds(adsRequestDto, userModel);

    const responseDal: IDalResponse = foundAds
      ? {
          entityId: persistedAdsId,
          dataOperation: DataOperation.Update
        }
      : {
          entityId: persistedAdsId,
          dataOperation: DataOperation.Create
        };

    return responseDal;
  }

  private async tryInsertAds(adsRequestDto: AdsRequestDto, userModel: UserModel): Promise<number> {
    const zupcParentId = await this.tryGetZupcParentIByInsee(adsRequestDto.insee);
    const query = `
      INSERT INTO
        public."ADS" (
          added_at,
          added_by,
          added_via,
          category,
          doublage,
          insee,
          last_update_at,
          numero,
          owner_name,
          owner_type,
          source,
          vdm_vignette,
          zupc_id
        )
        VALUES
          ($1::timestamp without time zone, $2::int, $3::via, $4::text, $5::boolean, $6::text, $7::timestamp without time zone, $8::text, $9::text, $10::owner_type_enum, $11::text, $12::text, $13::int)
        RETURNING *
    `;

    const queryResult = await postgrePool.query(query, [
      new Date().toISOString(),
      Number(userModel.id),
      'api',
      adsRequestDto.category,
      false,
      adsRequestDto.insee,
      null,
      adsRequestDto.numero,
      adsRequestDto.owner_name,
      adsRequestDto.owner_type,
      'added_by',
      adsRequestDto.vdm_vignette,
      zupcParentId
    ]);
    const insertedAds = queryResult.rows[0];

    return insertedAds.id;
  }

  private async tryUpdateAds(
    existingAdsId: number,
    existingAds: QueryResult['rows'][0],
    adsRequestDto: AdsRequestDto
  ): Promise<number> {
    const keys = Object.keys(existingAds);
    keys.forEach(key => {
      if (typeof adsRequestDto[key] === 'undefined') {
        adsRequestDto[key] = existingAds[key];
      }
    });

    const query = `
      UPDATE public."ADS"
      SET
        category = $1::text,
        doublage = $2::boolean,
        owner_name = $3::text,
        owner_type = $4::owner_type_enum,
        vdm_vignette = $5::text,
        last_update_at = $6::timestamp without time zone
      WHERE id = $7::int
      RETURNING id
    `;

    const queryResult = await postgrePool.query(query, [
      adsRequestDto.category,
      adsRequestDto.doublage,
      adsRequestDto.owner_name,
      adsRequestDto.owner_type,
      adsRequestDto.vdm_vignette,
      new Date().toISOString(),
      existingAdsId
    ]);

    return queryResult.rows[0].id;
  }

  public async getAdsById(adsId: number): Promise<AdsResponseDto> {
    const query = `
      SELECT
        category,
        doublage,
        insee,
        numero,
        owner_name,
        owner_type,
        vdm_vignette,
        null AS vehicle_id
      FROM public."ADS"
      WHERE id = $1::int
    `;

    const queryResult: QueryResult = await postgrePool.query(query, [adsId]);
    if (!queryResult || !queryResult.rows || !queryResult.rows[0]) {
      return null;
    }
    const adsResponseDto: AdsResponseDto = queryResult.rows[0];

    return adsResponseDto;
  }

  private async tryGetZupcParentIByInsee(insee: string): Promise<number> {
    const query = `
      SELECT parent_id
      FROM public."ZUPC"
      WHERE insee=$1::text
      LIMIT 1
    `;
    const queryResult: QueryResult = await postgrePool.query(query, [insee]);

    if (queryResult.rowCount === 0) {
      throw new BadRequestError(`Unable to find a ZUPC parent for insee: ${insee}`);
    }

    return queryResult.rows[0].parent_id;
  }
}

export const adsDataAccessLayer = new AdsDataAccessLayer();
