// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// Original Code from https://github.com/apburnes/random-points-on-polygon
"use strict";

const extent = require("turf-extent");
const featurecollection = require("turf-featurecollection");
const inside = require("turf-inside");
const random = require("turf-random");

/**
 * Takes a number and a feature and {@link Polygon} or {@link MultiPolygon} and returns {@link Points} that reside inside the polygon. The polygon can
 * be convex or concave. The function accounts for holes.
 *
 * * Given a {Number}, the number of points to be randomly generated.
 * * Given a {@link Polygon} or {@link MultiPolygon}, the boundary of the random points
 *
 *
 * @module turf-random-points-on-polygon
 * @category measurement
 * @param {Number} number of points to be generated
 * @param {Feature<(Polygon|MultiPolygon)>} polygon input polygon or multipolygon
 * @param {Object} [properties={}] properties to be appended to the point features
 * @param {Boolean} [fc=false] if true returns points as a {@link FeatureCollection}
 * @return {Array} || {FeatureCollection<Points>} an array or feature collection of the random points inside the polygon
 **/

export function randomPointsOnPolygon(
  number: any,
  polygon: any,
  properties?: any,
  fc?: any,
) {
  if (typeof properties === "boolean") {
    fc = properties;
    properties = {};
  }

  if (number < 1) {
    return new Error("Number must be >= 1");
  }

  if (polygon.type !== "Feature") {
    return new Error(
      "Polygon parameter must be a Feature<(Polygon|MultiPolygon)>",
    );

    if (
      polygon.geomtry.type !== "Polygon" ||
      polygon.geomtry.type !== "MutliPolygon"
    ) {
      return new Error(
        "Polygon parameter must be a Feature<(Polygon|MultiPolygon)>",
      );
    }
  }

  if (this instanceof randomPointsOnPolygon) {
    return randomPointsOnPolygon(number, polygon, properties);
  }

  properties = properties || {};
  fc = fc || false;
  const points = [];
  const bbox = extent(polygon);
  const count = Math.round(parseFloat(number));

  for (let i = 0; i <= count; i++) {
    if (i === count) {
      if (fc) {
        return featurecollection(points);
      }

      return points;
    }

    const point = random("point", 1, { bbox });

    if (inside(point.features[0], polygon) === false) {
      i = --i;
    }

    if (inside(point.features[0], polygon) === true) {
      point.features[0].properties = properties;
      points.push(point.features[0]);
    }
  }
}
