// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from '../../models/route.model';
import { buildApiEndpoint } from '../shared/utils/apiUtils';
import { gofsLiteController } from './gofsLite.controller';

export function getGofsLiteRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite'),
      handler: gofsLiteController.getFeeds
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/realtime_booking'),
      handler: gofsLiteController.getRealtimeBooking
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/service_brands'),
      handler: gofsLiteController.getServiceBrands
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/system_information'),
      handler: gofsLiteController.getSystemInformation
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/zones'),
      handler: gofsLiteController.getZones
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/operating_rules'),
      handler: gofsLiteController.getOperatingRules
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint('/api/gofs-lite/1/:lang/calendars'),
      handler: gofsLiteController.getCalendars
    }
  ];
}
