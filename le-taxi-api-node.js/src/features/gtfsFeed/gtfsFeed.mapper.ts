// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserModel } from '../users/user.model';
import {
  GtfsAgencyDto,
  GtfsBookingDeepLinksDto,
  GtfsBookingRulesDto,
  GtfsRoutesDto,
  GtfsTripsDto
} from './gtfsFeed.dto';

class GtfsFeedMapper {
  public operatorToAgency(operator: UserModel, now: string): GtfsAgencyDto[] {
    const agency: GtfsAgencyDto[] = [];
    if (operator.standard_booking_inquiries_starts_at <= now)
      agency.push({
        agency_id: operator.public_id,
        agency_name: operator.commercial_name,
        agency_url: operator.website_url,
        agency_timezone: 'America/Montreal',
        android_store_uri: operator.standard_booking_android_store_uri,
        ios_store_uri: operator.standard_booking_ios_store_uri
      });
    if (operator.special_need_booking_inquiries_starts_at <= now)
      agency.push({
        agency_id: `${operator.public_id}-special-need`,
        agency_name: `${operator.commercial_name} (Adapté)`,
        agency_url: operator.website_url,
        agency_timezone: 'America/Montreal',
        android_store_uri: operator.special_need_booking_android_store_uri,
        ios_store_uri: operator.special_need_booking_ios_store_uri
      });
    return agency;
  }

  public operatorToBookingDeepLinks(operator: UserModel, now: string): GtfsBookingDeepLinksDto[] {
    const bookingDeepLinks: GtfsBookingDeepLinksDto[] = [];
    if (operator.standard_booking_inquiries_starts_at <= now)
      bookingDeepLinks.push({
        booking_deep_link_id: `${operator.public_id}-standard-route-deep-link`,
        android_uri: operator.standard_booking_android_deeplink_uri,
        ios_uri: operator.standard_booking_ios_deeplink_uri,
        web_url: operator.standard_booking_website_url
      });
    if (operator.minivan_booking_inquiries_starts_at <= now)
      bookingDeepLinks.push({
        booking_deep_link_id: `${operator.public_id}-minivan-route-deep-link`,
        android_uri: operator.standard_booking_android_deeplink_uri,
        ios_uri: operator.standard_booking_ios_deeplink_uri,
        web_url: operator.standard_booking_website_url
      });
    if (operator.special_need_booking_inquiries_starts_at <= now)
      bookingDeepLinks.push({
        booking_deep_link_id: `${operator.public_id}-special-need-route-deep-link`,
        android_uri: operator.special_need_booking_android_deeplink_uri,
        ios_uri: operator.special_need_booking_ios_deeplink_uri,
        web_url: operator.special_need_booking_website_url
      });
    return bookingDeepLinks;
  }

  public operatorToRoutes(operator: UserModel, now: string): GtfsRoutesDto[] {
    const routes: GtfsRoutesDto[] = [];
    if (operator.standard_booking_inquiries_starts_at <= now)
      routes.push({
        agency_id: operator.public_id,
        route_id: `${operator.public_id}-standard-route`,
        route_type: '13',
        route_short_name: 'Taxi régulier',
        booking_deep_link_id: `${operator.public_id}-standard-route-deep-link`
      });
    if (operator.minivan_booking_inquiries_starts_at <= now)
      routes.push({
        agency_id: operator.public_id,
        route_id: `${operator.public_id}-minivan-route`,
        route_type: '13',
        route_short_name: 'Taxi fourgonnette',
        booking_deep_link_id: `${operator.public_id}-minivan-route-deep-link`
      });
    if (operator.special_need_booking_inquiries_starts_at <= now)
      routes.push({
        agency_id: `${operator.public_id}-special-need`,
        route_id: `${operator.public_id}-special-need-route`,
        route_type: '13',
        route_short_name: 'Taxi adapté',
        booking_deep_link_id: `${operator.public_id}-special-need-route-deep-link`
      });
    return routes;
  }

  public operatorToTrips(operator: UserModel, now: string): GtfsTripsDto[] {
    const trips: GtfsTripsDto[] = [];
    if (operator.standard_booking_inquiries_starts_at <= now) {
      trips.push({
        route_id: `${operator.public_id}-standard-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-standard-route-artm-to-artm-trip`
      });
      trips.push({
        route_id: `${operator.public_id}-standard-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-standard-route-artm-to-airport-trip`
      });
    }
    if (operator.minivan_booking_inquiries_starts_at <= now) {
      trips.push({
        route_id: `${operator.public_id}-minivan-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-minivan-route-artm-to-artm-trip`
      });
      trips.push({
        route_id: `${operator.public_id}-minivan-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-minivan-route-artm-to-airport-trip`
      });
    }
    if (operator.special_need_booking_inquiries_starts_at <= now) {
      trips.push({
        route_id: `${operator.public_id}-special-need-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-special-need-route-artm-to-artm-trip`
      });
      trips.push({
        route_id: `${operator.public_id}-special-need-route`,
        service_id: 'all-days',
        vehicle_category_id: 'sedan',
        trip_id: `${operator.public_id}-special-need-route-artm-to-airport-trip`
      });
    }
    return trips;
  }

  public operatorToBookingRules(operator: UserModel, now: string): GtfsBookingRulesDto[] {
    const bookingRules: GtfsBookingRulesDto[] = [];
    if (operator.standard_booking_inquiries_starts_at <= now)
      bookingRules.push({
        booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
        booking_type: '0',
        phone_number: operator.standard_booking_phone_number
      });
    if (operator.minivan_booking_inquiries_starts_at <= now)
      bookingRules.push({
        booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
        booking_type: '0',
        phone_number: operator.standard_booking_phone_number
      });
    if (operator.special_need_booking_inquiries_starts_at <= now)
      bookingRules.push({
        booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
        booking_type: '0',
        phone_number: operator.special_need_booking_phone_number
      });
    return bookingRules;
  }
}

export const gtfsFeedMapper = new GtfsFeedMapper();
