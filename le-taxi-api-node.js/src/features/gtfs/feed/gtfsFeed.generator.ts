// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Parser } from 'json2csv';
import { EOL } from 'os';
import { addDays, addYears, getDateNoDash } from '../../shared/dateUtils/dateUtils';
import { UserModel } from '../../users/user.model';
import {
  agency,
  bookingRules,
  calendar,
  emptyDeepLinks,
  feedInfo,
  riderCategories,
  routes,
  stopTimes,
  stops,
  trips,
  vehicleCategories
} from './gtfsFeed.constants';
import { gtfsFeedMapper } from './gtfsFeed.mapper';

const byteOrderMark = '\uFEFF';

export interface GtfsFeedGeneratorContext {
  now: string;
  promotedOperators: UserModel[];
}

class GtfsFeedGenerator {
  public getFeedInfo(context: GtfsFeedGeneratorContext) {
    const data = [
      {
        ...feedInfo,
        feed_start_date: getDateNoDash(context.now),
        feed_end_date: getDateNoDash(addDays(context.now, 1))
      }
    ];
    return jsonToCsv(data);
  }

  public getAgency(context: GtfsFeedGeneratorContext) {
    const data = [
      ...agency,
      ...context.promotedOperators.flatMap(operator => gtfsFeedMapper.operatorToAgency(operator, context.now))
    ];
    return jsonToCsv(data);
  }

  public getBookingDeepLinks(context: GtfsFeedGeneratorContext) {
    const data = context.promotedOperators.flatMap(operator =>
      gtfsFeedMapper.operatorToBookingDeepLinks(operator, context.now)
    );
    return jsonToCsv(data.length > 0 ? data : emptyDeepLinks);
  }

  public getRoutes(context: GtfsFeedGeneratorContext) {
    const data = [
      ...routes,
      ...context.promotedOperators.flatMap(operator => gtfsFeedMapper.operatorToRoutes(operator, context.now))
    ];
    return jsonToCsv(data);
  }

  public getTrips(context: GtfsFeedGeneratorContext) {
    const data = [
      ...trips,
      ...context.promotedOperators.flatMap(operator => gtfsFeedMapper.operatorToTrips(operator, context.now))
    ];
    return jsonToCsv(data);
  }

  public getCalendar(context: GtfsFeedGeneratorContext) {
    const data = [
      { ...calendar, start_date: getDateNoDash(context.now), end_date: getDateNoDash(addYears(context.now, 1)) }
    ];
    return jsonToCsv(data);
  }

  public getBookingRules(context: GtfsFeedGeneratorContext) {
    const data = [
      ...bookingRules,
      ...context.promotedOperators.flatMap(operator => gtfsFeedMapper.operatorToBookingRules(operator, context.now))
    ];
    return jsonToCsv(data);
  }

  public getRiderCategories(context: GtfsFeedGeneratorContext) {
    return jsonToCsv(riderCategories);
  }

  public getStops(context: GtfsFeedGeneratorContext) {
    return jsonToCsv(stops);
  }

  public getStopTimes(context: GtfsFeedGeneratorContext) {
    const data = [
      ...stopTimes,
      ...context.promotedOperators.flatMap(operator => gtfsFeedMapper.operatorToStopTimes(operator, context.now))
    ];
    return jsonToCsv(data);
  }

  public getVehicleCategories(context: GtfsFeedGeneratorContext) {
    return jsonToCsv(vehicleCategories);
  }
}

function jsonToCsv(data: any): string {
  const json2csvParser = new Parser();
  return byteOrderMark + json2csvParser.parse(data) + EOL;
}

export const gtfsFeedGenerator = new GtfsFeedGenerator();
