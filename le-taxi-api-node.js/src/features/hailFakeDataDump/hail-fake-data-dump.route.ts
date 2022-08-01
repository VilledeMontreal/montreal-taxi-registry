// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { hailFakeDataDumpController } from './hail-fake-data-dump.controller';

export function getHailFakeDataDumpRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/fake-data-dump/hails/resume/:format'),
      handler: hailFakeDataDumpController.resumeFakeData
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/fake-data-dump/hails/build/:timeSlot/'),
      handler: hailFakeDataDumpController.buildFakeData
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/fake-data-dump/hails/:timeSlot/'),
      handler: hailFakeDataDumpController.dumpFakeData
    }
  ];
}
