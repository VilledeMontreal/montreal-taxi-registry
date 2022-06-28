// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import { hailAnonymizeService } from './hail-anonymization.service';

class HailAnonymizationController {
  public async anonymize(req, res, next) {
    const response = await hailAnonymizeService.anonymize();
    const ret = {
      status: 'succes',
      modifiedRows: response
    };
    res.status(StatusCodes.OK).send(ret);
  }
}

export const hailAnonymizationController = new HailAnonymizationController();
