// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserModel } from '../users/user.model';
import {
  GtfsAgencyDto,
  GtfsBookingDeepLinksDto,
  GtfsBookingRulesDto,
  GtfsRoutesDto,
  GtfsStopTimesDto,
  GtfsTripsDto
} from './gtfsFeed.dto';

class GtfsFeedMapper {
  public operatorToAgency(operator: UserModel, now: string): GtfsAgencyDto[] {
    return distribute({
      operator,
      now,
      standard: standardAgency,
      minivan: null,
      specialNeed: specialNeedAgency
    });
  }

  public operatorToBookingDeepLinks(operator: UserModel, now: string): GtfsBookingDeepLinksDto[] {
    return distribute({
      operator,
      now,
      standard: standardBookingDeepLinks,
      minivan: minivanBookingDeepLinks,
      specialNeed: specialNeedBookingDeepLinks
    });
  }

  public operatorToRoutes(operator: UserModel, now: string): GtfsRoutesDto[] {
    return distribute({
      operator,
      now,
      standard: standardRoutes,
      minivan: minivanRoutes,
      specialNeed: specialNeedRoutes
    });
  }

  public operatorToTrips(operator: UserModel, now: string): GtfsTripsDto[] {
    return distribute({
      operator,
      now,
      standard: standardTrips,
      minivan: minivanTrips,
      specialNeed: specialNeedTrips
    });
  }

  public operatorToBookingRules(operator: UserModel, now: string): GtfsBookingRulesDto[] {
    return distribute({
      operator,
      now,
      standard: standardBookingRules,
      minivan: minivanBookingRules,
      specialNeed: specialNeedBookingRules
    });
  }

  public operatorToStopTimes(operator: UserModel, now: string): GtfsStopTimesDto[] {
    return distribute({
      operator,
      now,
      standard: standardStopTimes,
      minivan: minivanStopTimes,
      specialNeed: specialNeedStopTimes
    });
  }
}

function distribute<T>(options: {
  operator: UserModel;
  now: string;
  standard: (operator: UserModel) => T[];
  minivan: (operator: UserModel) => T[];
  specialNeed: (operator: UserModel) => T[];
}): T[] {
  const aggregator: T[] = [];
  if (options.standard && options.operator.standard_booking_inquiries_starts_at <= options.now)
    aggregator.push(...options.standard(options.operator));
  if (options.minivan && options.operator.minivan_booking_inquiries_starts_at <= options.now)
    aggregator.push(...options.minivan(options.operator));
  if (options.specialNeed && options.operator.special_need_booking_inquiries_starts_at <= options.now)
    aggregator.push(...options.specialNeed(options.operator));

  return aggregator;
}

function standardAgency(operator: UserModel): GtfsAgencyDto[] {
  return [
    {
      agency_id: operator.public_id,
      agency_name: operator.commercial_name,
      agency_url: operator.website_url,
      agency_timezone: 'America/Montreal',
      android_store_uri: operator.standard_booking_android_store_uri,
      ios_store_uri: operator.standard_booking_ios_store_uri
    }
  ];
}

function specialNeedAgency(operator: UserModel): GtfsAgencyDto[] {
  return [
    {
      agency_id: `${operator.public_id}-special-need`,
      agency_name: `${operator.commercial_name} (Adapté)`,
      agency_url: operator.website_url,
      agency_timezone: 'America/Montreal',
      android_store_uri: operator.special_need_booking_android_store_uri,
      ios_store_uri: operator.special_need_booking_ios_store_uri
    }
  ];
}

function standardBookingDeepLinks(operator: UserModel): GtfsBookingDeepLinksDto[] {
  return [
    {
      booking_deep_link_id: `${operator.public_id}-standard-route-deep-link`,
      android_uri: operator.standard_booking_android_deeplink_uri,
      ios_uri: operator.standard_booking_ios_deeplink_uri,
      web_url: operator.standard_booking_website_url
    }
  ];
}

function minivanBookingDeepLinks(operator: UserModel): GtfsBookingDeepLinksDto[] {
  return [
    {
      booking_deep_link_id: `${operator.public_id}-minivan-route-deep-link`,
      android_uri: operator.standard_booking_android_deeplink_uri,
      ios_uri: operator.standard_booking_ios_deeplink_uri,
      web_url: operator.standard_booking_website_url
    }
  ];
}

function specialNeedBookingDeepLinks(operator: UserModel): GtfsBookingDeepLinksDto[] {
  return [
    {
      booking_deep_link_id: `${operator.public_id}-special-need-route-deep-link`,
      android_uri: operator.special_need_booking_android_deeplink_uri,
      ios_uri: operator.special_need_booking_ios_deeplink_uri,
      web_url: operator.special_need_booking_website_url
    }
  ];
}

function standardRoutes(operator: UserModel): GtfsRoutesDto[] {
  return [
    {
      agency_id: operator.public_id,
      route_id: `${operator.public_id}-standard-route`,
      route_type: '13',
      route_long_name: 'Taxi régulier',
      booking_deep_link_id: `${operator.public_id}-standard-route-deep-link`
    }
  ];
}

function minivanRoutes(operator: UserModel): GtfsRoutesDto[] {
  return [
    {
      agency_id: operator.public_id,
      route_id: `${operator.public_id}-minivan-route`,
      route_type: '13',
      route_long_name: 'Taxi fourgonnette',
      booking_deep_link_id: `${operator.public_id}-minivan-route-deep-link`
    }
  ];
}

function specialNeedRoutes(operator: UserModel): GtfsRoutesDto[] {
  return [
    {
      agency_id: `${operator.public_id}-special-need`,
      route_id: `${operator.public_id}-special-need-route`,
      route_type: '13',
      route_long_name: 'Taxi adapté',
      booking_deep_link_id: `${operator.public_id}-special-need-route-deep-link`
    }
  ];
}

function standardTrips(operator: UserModel): GtfsTripsDto[] {
  return [
    {
      route_id: `${operator.public_id}-standard-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-standard-route-artm-to-artm-trip`
    },
    {
      route_id: `${operator.public_id}-standard-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-standard-route-artm-to-airport-trip`
    }
  ];
}

function minivanTrips(operator: UserModel): GtfsTripsDto[] {
  return [
    {
      route_id: `${operator.public_id}-minivan-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-minivan-route-artm-to-artm-trip`
    },
    {
      route_id: `${operator.public_id}-minivan-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-minivan-route-artm-to-airport-trip`
    }
  ];
}

function specialNeedTrips(operator: UserModel): GtfsTripsDto[] {
  return [
    {
      route_id: `${operator.public_id}-special-need-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-special-need-route-artm-to-artm-trip`
    },
    {
      route_id: `${operator.public_id}-special-need-route`,
      service_id: 'all-days',
      vehicle_category_id: 'sedan',
      trip_id: `${operator.public_id}-special-need-route-artm-to-airport-trip`
    }
  ];
}

function standardBookingRules(operator: UserModel): GtfsBookingRulesDto[] {
  return [
    {
      booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
      booking_type: '0',
      phone_number: operator.standard_booking_phone_number
    }
  ];
}

function minivanBookingRules(operator: UserModel): GtfsBookingRulesDto[] {
  return [
    {
      booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
      booking_type: '0',
      phone_number: operator.standard_booking_phone_number
    }
  ];
}

function specialNeedBookingRules(operator: UserModel): GtfsBookingRulesDto[] {
  return [
    {
      booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
      booking_type: '0',
      phone_number: operator.special_need_booking_phone_number
    }
  ];
}

function standardStopTimes(operator: UserModel): GtfsStopTimesDto[] {
  return [
    {
      trip_id: `${operator.public_id}-standard-route-artm-to-artm-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-standard-route-artm-to-artm-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-standard-route-artm-to-airport-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-standard-route-artm-to-airport-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-standard-route-booking-rule`,
      rider_category_id: 'all-riders'
    }
  ];
}
function minivanStopTimes(operator: UserModel): GtfsStopTimesDto[] {
  return [
    {
      trip_id: `${operator.public_id}-minivan-route-artm-to-artm-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-minivan-route-artm-to-artm-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-minivan-route-artm-to-airport-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-minivan-route-artm-to-airport-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-minivan-route-booking-rule`,
      rider_category_id: 'all-riders'
    }
  ];
}
function specialNeedStopTimes(operator: UserModel): GtfsStopTimesDto[] {
  return [
    {
      trip_id: `${operator.public_id}-special-need-route-artm-to-artm-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-special-need-route-artm-to-artm-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-special-need-route-artm-to-airport-trip`,
      stop_sequence: '1',
      stop_id: 'artm',
      pickup_type: '4',
      drop_off_type: '1',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
      rider_category_id: 'all-riders'
    },
    {
      trip_id: `${operator.public_id}-special-need-route-artm-to-airport-trip`,
      stop_sequence: '2',
      stop_id: 'artm',
      pickup_type: '1',
      drop_off_type: '4',
      pickup_proximity_level: '1',
      drop_off_proximity_level: '1',
      start_pickup_dropoff_window: '00:00:00',
      end_pickup_dropoff_window: '24:00:00',
      booking_rule_id: `${operator.public_id}-special-need-route-booking-rule`,
      rider_category_id: 'all-riders'
    }
  ];
}

export const gtfsFeedMapper = new GtfsFeedMapper();
