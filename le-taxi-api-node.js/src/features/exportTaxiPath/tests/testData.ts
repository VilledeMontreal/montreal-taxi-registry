// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { TaxiStatus } from "../../../libs/taxiStatus";

export const taxiInfoSample = {
  id: "uqV66GZ",
  vehicle_id: 9999,
  ads_id: 7777,
  driver_id: 5555,
  rating: 4.5,
  ban_begin: null,
  ban_end: null,
  numero: "6M999954001A",
  insee: "1000",
  vdm_vignette: "5314",
  owner_name: "JOHN",
  model_id: 3,
  constructor_id: 6,
  model_year: 2016,
  engine: null,
  horse_power: 0,
  relais: false,
  horodateur: null,
  taximetre: null,
  date_dernier_ct: null,
  date_validite_ct: null,
  special_need_vehicle: false,
  type_: "sedan",
  luxury: false,
  credit_card_accepted: false,
  nfc_cc_accepted: false,
  amex_accepted: false,
  bank_check_accepted: false,
  fresh_drink: false,
  dvd_player: false,
  tablet: false,
  wifi: false,
  baby_seat: false,
  bike_accepted: false,
  pet_accepted: false,
  air_con: false,
  electronic_toll: false,
  gps: false,
  cpam_conventionne: false,
  every_destination: false,
  color: "GRIS",
  status: TaxiStatus.Off,
  nb_seats: 4,
  private: false,
  first_name: "JOHN",
  last_name: "JOHN SMITH",
  professional_licence: "133720",
  licence_plate: "TESTLICENSE",
  nom_operator: "test@mtl.ca",
  model_name: "SENTRA",
};

export const taxiSnapshotSample = [
  {
    lat: "45.53425532309666",
    lon: "-73.54244341343832",
    status: TaxiStatus.Free,
    speed: "14",
    azimuth: "167",
    timestampUTC: "2019-07-04T17:41:01.000Z",
  },
  {
    lat: "45.5338029",
    lon: "-73.5425623",
    status: TaxiStatus.Free,
    speed: "22",
    azimuth: "163",
    timestampUTC: "2019-07-04T17:41:05.000Z",
  },
];

export const geoPositionsSample = {
  line: [
    [-73.54244341343832, 45.53425532309666],
    [-73.5425623, 45.5338029],
  ],
};

export const expectedGeoJsonPayload = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: geoPositionsSample.line[0],
      },
      properties: {
        status: taxiSnapshotSample[0].status,
        speed: taxiSnapshotSample[0].speed,
        azimuth: taxiSnapshotSample[0].azimuth,
        timestampUTC: taxiSnapshotSample[0].timestampUTC,
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: geoPositionsSample.line[1],
      },
      properties: {
        status: taxiSnapshotSample[1].status,
        speed: taxiSnapshotSample[1].speed,
        azimuth: taxiSnapshotSample[1].azimuth,
        timestampUTC: taxiSnapshotSample[1].timestampUTC,
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: geoPositionsSample.line,
      },
      properties: taxiInfoSample,
    },
  ],
};
