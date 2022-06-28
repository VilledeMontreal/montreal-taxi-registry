// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import superagent = require('superagent');
import { StatusCodes } from 'http-status-codes';
import { InternalServerError } from '../errorHandling/errors';
import { UserModel } from '../users/user.model';
import { HailResponseDto, OperatorHailResponseDto } from './hail.dto';

class OperatorApiClient {
  public async postHail(dto: HailResponseDto, operator: UserModel): Promise<OperatorHailResponseDto> {
    const responseOperator = await this.postOperatorApi(dto, operator);
    if (responseOperator.status !== StatusCodes.OK) {
      this.throwPostHailFailWithoutSensitiveInformation(dto, operator, responseOperator.status);
    }
    return {
      taxi_phone_number:
        responseOperator.body &&
        responseOperator.body.data &&
        responseOperator.body.data[0] &&
        responseOperator.body.data[0].taxi_phone_number
          ? responseOperator.body.data[0].taxi_phone_number
          : null
    };
  }

  private async postOperatorApi(dto: HailResponseDto, operator: UserModel) {
    try {
      return await superagent
        .post(`${operator.hail_endpoint_production}`)
        .set(operator.operator_header_name, operator.operator_api_key)
        .set('X-VERSION', '2')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ data: [dto] });
    } catch (err) {
      if (this.isInvalidJson(err)) {
        return {
          status: StatusCodes.OK,
          body: null // null body if invalid json
        };
      }
      // The original error is intentionnaly not rethrown in ordre to avoid leaking sensitive information.
      // Ex: api key, customer address, customer phone, lon, lat, etc.
      const httpsStatus = err.status ? err.status : 'Unknown because unexpected error';
      this.throwPostHailFailWithoutSensitiveInformation(dto, operator, httpsStatus, err);
    }
  }

  private isInvalidJson(err: any) {
    return err.statusCode === StatusCodes.OK;
  }

  private throwPostHailFailWithoutSensitiveInformation(
    hailResponseDto: HailResponseDto,
    operator: UserModel,
    httpStatus: any,
    err?: any
  ) {
    const errMessage = err ? JSON.stringify(err.response.body) : 'n/a';
    throw new InternalServerError(
      `POST hail(${hailResponseDto.id}) to the operator server (${operator.email}) failed. Http status = ${httpStatus}. Error message: ${errMessage}`
    );
  }
}

export const operatorApiClient = new OperatorApiClient();
