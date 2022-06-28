// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { hailAnonymizationController } from './hail-anonymization.controller';

export function getHailAnonymizationRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/worker/hail-anonymization-tasks/'),
      handler: hailAnonymizationController.anonymize
    }
  ];
}
