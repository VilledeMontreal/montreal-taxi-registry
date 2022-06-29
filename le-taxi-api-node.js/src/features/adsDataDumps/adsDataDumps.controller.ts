// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { stringify } from 'JSONStream';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { validateEncoding, validateEtag } from '../shared/dataDumps/dataDumps.validators';
import { generateEtag } from '../shared/eTags/eTagUtils';
import { allow } from '../users/securityDecorator';
import { UserRole } from '../users/userRole';
import { adsDataDumpsAccessLayer } from './adsDataDumps.dal';

const pipelineAsync = promisify(pipeline);

class AdsDataDumpsController {
  @allow([UserRole.Admin, UserRole.Manager, UserRole.Stats])
  public async getAdsDataDumps(request: Request, response: Response) {
    validateEncoding(request);

    const lastDate = await adsDataDumpsAccessLayer.getLastDate(request.query.operator as string);
    validateEtag(request, lastDate);

    const stream = await adsDataDumpsAccessLayer.getStream(request.query.operator as string);
    response.setHeader('etag', generateEtag(lastDate));

    await pipelineAsync(stream, stringify(), response.type('json'));
  }
}

export const adsDataDumpsController = new AdsDataDumpsController();
