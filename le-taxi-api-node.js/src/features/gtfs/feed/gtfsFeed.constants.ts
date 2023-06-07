// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  GtfsAgencyDto,
  GtfsBookingDeepLinksDto,
  GtfsBookingRulesDto,
  GtfsCalendarDto,
  GtfsFeedInfoDto,
  GtfsRiderCategoriesDto,
  GtfsRoutesDto,
  GtfsStopsDto,
  GtfsStopTimesDto,
  GtfsTripsDto,
  GtfsVehicleCategoriesDto
} from './gtfsFeed.dto';

export const feedInfo: Partial<GtfsFeedInfoDto> = {
  feed_publisher_name: 'Registre des taxis',
  feed_publisher_url: 'http://registretaximontreal.ca',
  feed_lang: 'fr'
};

export const agency: Partial<GtfsAgencyDto>[] = [
  {
    agency_id: 'taxi-registry',
    agency_name: 'Registre des taxis de Montréal',
    agency_url: 'http://www.registretaximontreal.ca/',
    agency_timezone: 'America/Montreal'
  },
  {
    agency_id: 'taxi-registry-special-need',
    agency_name: 'Registre des taxis de Montréal (Adapté)',
    agency_url: 'http://www.registretaximontreal.ca/',
    agency_timezone: 'America/Montreal'
  }
];

export const emptyDeepLinks: Partial<GtfsBookingDeepLinksDto> = {
  booking_deep_link_id: null,
  android_uri: null,
  ios_uri: null,
  web_url: null
};

export const routes: Partial<GtfsRoutesDto>[] = [
  {
    agency_id: 'taxi-registry',
    route_id: 'taxi-registry-standard',
    route_type: '13',
    route_long_name: 'Taxi régulier'
  },
  {
    agency_id: 'taxi-registry',
    route_id: 'taxi-registry-minivan',
    route_type: '13',
    route_long_name: 'Taxi fourgonnette'
  },
  {
    agency_id: 'taxi-registry',
    route_id: 'taxi-registry-special-need',
    route_type: '13',
    route_long_name: 'Taxi adapté'
  }
];

export const trips: Partial<GtfsTripsDto>[] = [
  {
    route_id: 'taxi-registry-standard',
    service_id: 'all-days',
    vehicle_category_id: 'sedan',
    trip_id: 'taxi-registry-standard-artm-to-artm-trip'
  },
  {
    route_id: 'taxi-registry-standard',
    service_id: 'all-days',
    vehicle_category_id: 'sedan',
    trip_id: 'taxi-registry-standard-artm-to-airport-trip'
  },
  {
    route_id: 'taxi-registry-minivan',
    service_id: 'all-days',
    vehicle_category_id: 'minivan',
    trip_id: 'taxi-registry-minivan-artm-to-artm-trip'
  },
  {
    route_id: 'taxi-registry-minivan',
    service_id: 'all-days',
    vehicle_category_id: 'minivan',
    trip_id: 'taxi-registry-minivan-artm-to-airport-trip'
  },
  {
    route_id: 'taxi-registry-special-need',
    service_id: 'all-days',
    vehicle_category_id: 'sedan',
    trip_id: 'taxi-registry-special-need-artm-to-artm-trip'
  },
  {
    route_id: 'taxi-registry-special-need',
    service_id: 'all-days',
    vehicle_category_id: 'sedan',
    trip_id: 'taxi-registry-special-need-artm-to-airport-trip'
  }
];

export const calendar: Partial<GtfsCalendarDto> = {
  service_id: 'all-days',
  monday: '1',
  tuesday: '1',
  wednesday: '1',
  thursday: '1',
  friday: '1',
  saturday: '1',
  sunday: '1'
};

export const bookingRules: Partial<GtfsBookingRulesDto>[] = [
  {
    booking_rule_id: 'taxi-registry-standard-booking-rule',
    booking_type: '0'
  },
  {
    booking_rule_id: 'taxi-registry-minivan-booking-rule',
    booking_type: '0'
  },
  {
    booking_rule_id: 'taxi-registry-special-need-booking-rule',
    booking_type: '0'
  }
];

export const stopTimes: Partial<GtfsStopTimesDto>[] = [
  {
    trip_id: 'taxi-registry-standard-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-standard-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-standard-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'artm',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-standard-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-standard-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-standard-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-standard-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'airport',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-standard-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-minivan-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-minivan-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-minivan-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'artm',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-minivan-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-minivan-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-minivan-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-minivan-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'airport',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-minivan-booking-rule',
    rider_category_id: 'all-riders'
  },
  {
    trip_id: 'taxi-registry-special-need-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-special-need-booking-rule',
    rider_category_id: 'riders-with-special-needs'
  },
  {
    trip_id: 'taxi-registry-special-need-artm-to-artm-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'artm',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-special-need-booking-rule',
    rider_category_id: 'riders-with-special-needs'
  },
  {
    trip_id: 'taxi-registry-special-need-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '1',
    stop_id: 'artm',
    pickup_type: '4',
    drop_off_type: '1',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-special-need-booking-rule',
    rider_category_id: 'riders-with-special-needs'
  },
  {
    trip_id: 'taxi-registry-special-need-artm-to-airport-trip',
    arrival_time: '00:00:00',
    departure_time: '00:00:00',
    stop_sequence: '2',
    stop_id: 'airport',
    pickup_type: '1',
    drop_off_type: '4',
    pickup_proximity_level: '1',
    drop_off_proximity_level: '1',
    start_pickup_dropoff_window: '00:00:00',
    end_pickup_dropoff_window: '24:00:00',
    booking_rule_id: 'taxi-registry-special-need-booking-rule',
    rider_category_id: 'riders-with-special-needs'
  }
];

export const riderCategories: Partial<GtfsRiderCategoriesDto>[] = [
  {
    rider_category_id: 'all-riders',
    rider_category_name: 'Tout public'
  },
  {
    rider_category_id: 'riders-with-special-needs',
    rider_category_name: 'Personnes à mobilité réduite'
  }
];

export const vehicleCategories: Partial<GtfsVehicleCategoriesDto>[] = [
  {
    vehicle_category_id: 'sedan',
    max_capacity: '3'
  },
  {
    vehicle_category_id: 'minivan',
    max_capacity: '5'
  }
];

export const stops: Partial<GtfsStopsDto>[] = [
  {
    stop_id: 'artm',
    stop_lat: null,
    stop_lon: null,
    stop_name: 'artm zone',
    stop_desc: 'See locations.geojson for artm zone definition'
  },
  {
    stop_id: 'airport',
    stop_lat: null,
    stop_lon: null,
    stop_name: 'airport zone',
    stop_desc: 'See locations.geojson for airport zone definition'
  }
];
