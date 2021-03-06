// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { inquiryController } from './inquiry.controller';

export function getInquiryRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.POST,
      path: buildApiEndpoint('/api/inquiry/'),
      handler: inquiryController.postInquiry
    }
  ];
}
