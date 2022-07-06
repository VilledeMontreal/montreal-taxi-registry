// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { addSec } from '../shared/dateUtils/dateUtils';
import { taxiEstimatePostgrePool } from '../shared/taxiEstimate/taxiEstimatePostgre';
import { postgrePool } from '../shared/taxiPostgre/taxiPostgre';
import { taxiEstimateAccuracyRepository } from '../tripEstimateAccuracy/tripEstimateAccuracy.repository';
import { findMatches, insertMatches } from './tripEstimateMatch.constants';

const BATCH_SIZE = 200;
const MATCH_SECONDS_DELTA = 30;
const MATCH_LAT_DELTA = 0.01;
const MATCH_LON_DELTA = 0.01;

class TripEstimateMatchProcessor {
  public async process(sampleId: number, startDate: string, endDate: string): Promise<void> {
    const realTripsCount = await taxiEstimateAccuracyRepository.getRealTripsCountForMatching(
      sampleId,
      startDate,
      endDate
    );
    const pages = realTripsCount / BATCH_SIZE;

    let matchesFound = 0;
    let noMatchesFound = 0;
    let multipleMatchesFound = 0;
    let tripsProcessed = 0;

    for (let i = 0; i < pages; i++) {
      const trips = await taxiEstimateAccuracyRepository.getRealTripsBatchForMatching(
        sampleId,
        startDate,
        endDate,
        i * BATCH_SIZE,
        BATCH_SIZE
      );
      const matchesToInsert = await Promise.all(
        trips?.map(async trip => {
          const date = new Date(trip.departure_time).toISOString();
          const params = [
            addSec(date, -MATCH_SECONDS_DELTA),
            addSec(date, MATCH_SECONDS_DELTA),
            trip.departure_lat - MATCH_LAT_DELTA,
            trip.departure_lat + MATCH_LAT_DELTA,
            trip.departure_lon - MATCH_LON_DELTA,
            trip.departure_lon + MATCH_LON_DELTA,
            trip.arrival_lat - MATCH_LAT_DELTA,
            trip.arrival_lat + MATCH_LAT_DELTA,
            trip.arrival_lon - MATCH_LON_DELTA,
            trip.arrival_lon + MATCH_LON_DELTA
          ];
          const matches = await postgrePool.query(findMatches, params);

          if (matches.rows.length === 0) {
            ++noMatchesFound;
            return null;
          } else if (matches.rows.length > 1) {
            ++multipleMatchesFound;
            return null;
          } else {
            const match = matches.rows[0];
            return {
              sample_id: sampleId,
              real_trip_id: +trip.id,
              taxi_trip_id: match.id
            };
          }
        })
      );
      const filteredMatchesToInsert = matchesToInsert.filter(match => !!match);
      console.log(`Found ${filteredMatchesToInsert.length} matches out of ${trips.length}`);
      await taxiEstimatePostgrePool.query(insertMatches, [JSON.stringify(filteredMatchesToInsert)]);
      matchesFound += filteredMatchesToInsert.length;
      tripsProcessed += trips.length;
    }
    console.log(
      `TOTAL => Found ${matchesFound} matches out of ${tripsProcessed} - No matches count: ${noMatchesFound} - Multiple matches count: ${multipleMatchesFound}`
    );
  }
}

export const tripMatchProcessor = new TripEstimateMatchProcessor();
