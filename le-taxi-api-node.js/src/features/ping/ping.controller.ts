// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { integrationTool } from '../integrationTools/integrationToolDecorator';

class PingController {
  /*
  Returns a pong message with the current timestamp in UTC.
  Example 1: '/api/ping' would return a pong message immediately.
  Example 2: '/api/ping?delayInMs=5000' would return a pong message 5 seconds from now.
  Note that the 'delayInMs' querystring parameter is not case-sensitive.
*/

  @integrationTool()
  public async getPing(request: Request, response: Response) {
    let delayInMs: number = 0;
    for (const querystringParameter in request.query) {
      if (querystringParameter.toLowerCase() === 'delayinms') {
        delayInMs = +request.query[querystringParameter];
        break;
      }
    }
    setTimeout(() => {
      const message: string = `pong at ${new Date().toISOString()}`;
      response.status(StatusCodes.OK).send(message);
    }, delayInMs);
  }

  @integrationTool()
  public async getPingHeavy(request: Request, response: Response) {
    let size: number = 1;
    for (const querystringParameter in request.query) {
      if (querystringParameter.toLowerCase() === 'size') {
        size = +request.query[querystringParameter];
        break;
      }
    }
    const array = Array(size).fill('some value');
    array.reverse();
    response.status(StatusCodes.OK).send('Finished long process operation.');
  }
}

export const pingController = new PingController();
