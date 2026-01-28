// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { HttpMethods, IHandlerRoute } from "../../models/route.model";
import { buildApiEndpoint } from "../shared/utils/apiUtils";
import { gofsController } from "./gofs.controller";

export function getGofsRoutes(): IHandlerRoute[] {
  return [
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs"),
      handler: gofsController.getFeeds,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/realtime_booking"),
      handler: gofsController.getRealtimeBooking,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/service_brands.json"),
      handler: gofsController.getServiceBrands,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/system_information.json"),
      handler: gofsController.getSystemInformation,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/zones.json"),
      handler: gofsController.getZones,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/operating_rules.json"),
      handler: gofsController.getOperatingRules,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs/1/:lang/calendars.json"),
      handler: gofsController.getCalendars,
    },
    // DEPRECATED
    // TODO - Remove once the search engines made the switch
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs-lite"),
      handler: gofsController.getFeeds,
    },
    {
      method: HttpMethods.GET,
      path: buildApiEndpoint("/api/gofs-lite/1/:lang/realtime_booking"),
      handler: gofsController.getRealtimeBooking,
    },
  ];
}
