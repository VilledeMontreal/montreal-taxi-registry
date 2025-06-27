// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Request, Response } from "express";
import * as fs from "fs";
import * as JSZip from "jszip";
import { nowUtcIsoString } from "../../shared/dateUtils/dateUtils";
import { allow } from "../../users/securityDecorator";
import { userRepository } from "../../users/user.repository";
import { UserRole } from "../../users/userRole";
import { gtfsFeedGenerator } from "./gtfsFeed.generator";

class GtfsFeedController {
  @allow([
    UserRole.Admin,
    UserRole.Operator,
    UserRole.Manager,
    UserRole.Inspector,
    UserRole.Prefecture,
    UserRole.Motor,
    UserRole.Stats,
  ])
  public async getGtfsFeed(request: Request, response: Response) {
    const context = {
      now: nowUtcIsoString(),
      promotedOperators: (await userRepository.getPromotedOperators()) ?? [],
    };
    const zip = new JSZip();
    zip.file("feed_info.txt", gtfsFeedGenerator.getFeedInfo(context));
    zip.file("agency.txt", gtfsFeedGenerator.getAgency(context));
    zip.file(
      "booking_deep_links.txt",
      gtfsFeedGenerator.getBookingDeepLinks(context)
    );
    zip.file("routes.txt", gtfsFeedGenerator.getRoutes(context));
    zip.file("trips.txt", gtfsFeedGenerator.getTrips(context));
    zip.file("calendar.txt", gtfsFeedGenerator.getCalendar(context));
    zip.file("booking_rules.txt", gtfsFeedGenerator.getBookingRules(context));
    zip.file(
      "rider_categories.txt",
      gtfsFeedGenerator.getRiderCategories(context)
    );
    zip.file(
      "locations.geojson",
      fs.readFileSync("src/features/shared/locations/locations.json")
    );
    zip.file("stops.txt", gtfsFeedGenerator.getStops(context));
    zip.file("stop_times.txt", gtfsFeedGenerator.getStopTimes(context));
    zip.file(
      "vehicle_categories.txt",
      gtfsFeedGenerator.getVehicleCategories(context)
    );

    const stream = zip.generateNodeStream({
      type: "nodebuffer",
      streamFiles: true,
    });
    response.setHeader("Content-Type", "application/zip");
    response.setHeader(
      "Content-disposition",
      "attachment; filename=gtfs_feed.zip"
    );
    stream.pipe(response);
  }
}

export const gtfsFeedController = new GtfsFeedController();
