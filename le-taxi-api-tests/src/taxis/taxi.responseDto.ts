// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { inseeWithOwnerSemanticForADS } from "../ads/adsDto.template";

export const responseObjectModel = {
  ads: {
    insee: inseeWithOwnerSemanticForADS,
    numero: "test-coop-z1",
  },
  driver: {
    departement: "1000",
    professional_licence: "test-ops-z",
  },
  position: {
    lat: 0,
    lon: 0,
  },
  vehicle: {
    characteristics: [
      "every_destination",
      "gps",
      "pet_accepted",
      "bike_accepted",
      "credit_card_accepted",
      "luxury",
    ],
    color: "GRISE",
    constructor: "TOYOTA",
    licence_plate: "test-ops-z2",
    model: "SIENNA",
    nb_seats: 6,
  },
  crowfly_distance: 0,
  id: "VsLwptA",
  last_update: 1502819736,
  operator: "coop",
  private: false,
  rating: 4.42332039594968,
  status: "answering",
};
