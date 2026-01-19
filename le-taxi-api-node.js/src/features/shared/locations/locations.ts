// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { FeatureCollection } from "geojson";
import downtown from "./downtown.json";
import locations from "./locations.json";

export const locationsGeoJson = locations as FeatureCollection;
export const airportGeometry = locations.features[0].geometry.coordinates[0];
export const downtownGeometry = downtown.features[0].geometry.coordinates[0];
