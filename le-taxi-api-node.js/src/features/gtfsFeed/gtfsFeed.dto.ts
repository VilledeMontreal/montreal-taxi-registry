// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class GtfsFeedInfoDto {
  feed_publisher_name: string;
  feed_publisher_url: string;
  feed_lang: string;
  feed_start_date: string;
  feed_end_date: string;
}

export class GtfsAgencyDto {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  android_store_uri: string;
  ios_store_uri: string;
}

export class GtfsBookingDeepLinksDto {
  booking_deep_link_id: string;
  android_uri: string;
  ios_uri: string;
  web_url: string;
}

export class GtfsRoutesDto {
  agency_id: string;
  route_id: string;
  route_type: string;
  route_long_name: string;
  booking_deep_link_id: string;
}

export class GtfsTripsDto {
  route_id: string;
  service_id: string;
  vehicle_category_id: string;
  trip_id: string;
}

export class GtfsCalendarDto {
  service_id: string;
  start_date: string;
  end_date: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export class GtfsBookingRulesDto {
  booking_rule_id: string;
  booking_type: string;
  phone_number: string;
}

export class GtfsRiderCategoriesDto {
  rider_category_id: string;
  rider_category_name: string;
}

export class GtfsStopsDto {
  stop_id: string;
  stop_lat: string;
  stop_lon: string;
  stop_name: string;
  stop_desc: string;
}

export class GtfsStopTimesDto {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_sequence: string;
  stop_id: string;
  pickup_type: string;
  drop_off_type: string;
  pickup_proximity_level: string;
  drop_off_proximity_level: string;
  start_pickup_dropoff_window: string;
  end_pickup_dropoff_window: string;
  booking_rule_id: string;
  rider_category_id: string;
}

export class GtfsVehicleCategoriesDto {
  vehicle_category_id: string;
  max_capacity: string;
}
