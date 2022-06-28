// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NextFunction, Request, Response } from 'express';
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { hailController } from './hail.controller';

export function getHailRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/hails/'),
      handler: (req: Request, res: Response, next: NextFunction) => hailController.postHail(req, res, next)
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/hails/:id'),
      handler: (req: Request, res: Response, next: NextFunction) => hailController.getHail(req, res, next)
    },
    {
      method: HttpMethods.PUT,
      path: buildApiEndpoint('/api/hails/:id'),
      handler: (req: Request, res: Response, next: NextFunction) => hailController.updateHail(req, res, next)
    }
  ];
}
