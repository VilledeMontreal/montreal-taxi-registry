// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class TaxiInputModel {
  constructor(vehicle: inputVehicle, driver: inputDriver, ads: inputAds, status: string) {
    this.vehicle = vehicle;
    this.driver = driver;
    this.ads = ads;
    this.status = status;
  }

  vehicle: inputVehicle;
  driver: inputDriver;
  ads: inputAds;
  status: string;
}

export class TaxiReturnModel {
  driver: inputDriver;
  ads: inputAds;
  status: string;

  id: string;
  last_update_at: string;
  operateur: string;
  position: returnPosition;

  private: boolean;
  rating: number;
  vehicle: returnVehicle;
}

export class TaxiDetailModel {
  ads: inputAds;
  crowfly_distance: number;

  driver: inputDriver;

  id: string;
  last_update_at: string;
  operateur: string;
  position: returnPosition;

  private: boolean;
  rating: number;
  status: string;
  vehicle: returnVehicle;
}

export class inputVehicle {
  constructor(licencePlate: string) {
    this.licence_plate = licencePlate;
  }
  licence_plate: string;
}

export class returnVehicle {
  constructor(
    characteristics: Array<string>,
    color: string,
    constructor: string,
    licence_plate: string,
    model: string,
    nb_seats: number
  ) {
    this.characteristics = characteristics;
    this.color = color;
    this.constuctor = constructor;
    this.licence_plate = licence_plate;
    this.model = model;
    this.nb_seats = nb_seats;
  }

  characteristics: Array<string>;
  color: string;
  constuctor: string;
  licence_plate: string;
  model: string;
  nb_seats: number;
}

export class inputDriver {
  constructor(departement: string, professionalLicence: string) {
    this.departement = departement;
    this.professional_licence = professionalLicence;
  }
  departement: string;
  professional_licence: string;
}

export class inputAds {
  constructor(insee: string, numero: string) {
    this.insee = insee;
    this.numero = numero;
  }
  insee: string;
  numero: string;
}

export class returnPosition {
  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }
  lat: number;
  lon: number;
}

export class GeoSendPosition {
  constructor(
    taxi: string,
    lat: number,
    lon: number,
    operator: string,
    timestamp: string,
    status: string,
    version: string,
    speed: number,
    azimuth: number
  ) {
    this.taxi = taxi;
    this.lat = lat;
    this.lon = lon;
    this.operator = operator;
    this.timestamp = timestamp;
    this.status = status;
    this.version = version;
    this.speed = speed;
    this.azimuth = azimuth;
  }

  taxi: string;
  device = 'phone';
  operator: string;
  lat: number;
  lon: number;
  status: string;
  timestamp: string;
  version: string;
  speed: number;
  azimuth: number;
}
