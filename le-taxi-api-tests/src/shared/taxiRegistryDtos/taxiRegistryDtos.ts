// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// One file with all taxi registry dto types
// Could become an npm package, but only a shared file for now

export interface IDriver {
  data: [
    {
      birth_date: Date;
      departement: DepartementDto;
      first_name: string;
      last_name: string;
      professional_licence: string;
    },
  ];
}

export class DepartementDto {
  public nom: string;
  public numero: string;
}

export interface IUser {
  id?: string;
  email: string;
  apikey?: string;
  password?: string;
  public_id?: string;
  commercial_name: string;
  active?: string;
  role: number;
  email_customer?: string;
  email_technical?: string;
  phone_number_technical?: string;
  website_url?: string;
  standard_booking_phone_number?: string;
  standard_booking_website_url?: string;
  standard_booking_android_deeplink_uri?: string;
  standard_booking_android_store_uri?: string;
  standard_booking_ios_deeplink_uri?: string;
  standard_booking_ios_store_uri?: string;
  standard_booking_is_promoted_to_public?: boolean;
  standard_booking_inquiries_starts_at?: string;
  minivan_booking_is_available_from_web_url?: boolean;
  minivan_booking_is_available_from_android_uri?: boolean;
  minivan_booking_is_available_from_ios_uri?: boolean;
  minivan_booking_is_promoted_to_public?: boolean;
  minivan_booking_inquiries_starts_at?: string;
  special_need_booking_phone_number?: string;
  special_need_booking_website_url?: string;
  special_need_booking_android_deeplink_uri?: string;
  special_need_booking_android_store_uri?: string;
  special_need_booking_ios_deeplink_uri?: string;
  special_need_booking_ios_store_uri?: string;
  special_need_booking_is_promoted_to_public?: boolean;
  special_need_booking_inquiries_starts_at?: string;
}

export interface ITaxi {
  data: [
    {
      ads: {
        insee: string;
        numero: string;
      };
      driver: {
        departement: string;
        professional_licence: string;
      };
      vehicle: {
        licence_plate: string;
      };
      status: string;
      private: boolean;
    },
  ];
}

export interface IPutTaxiRequest {
  data: [
    {
      status: string;
      private: boolean;
    },
  ];
}

interface IAdsRow {
  category: string;
  vehicle_id: number;
  insee: string;
  numero: string;
  owner_name: string;
  owner_type: string;
  doublage: boolean;
  vdm_vignette?: string;
}

export interface IAds {
  data: [IAdsRow];
}

export interface IVehicle {
  data: [
    {
      id?: number;
      air_con: boolean;
      bonjour: boolean;
      horodateur: string;
      color: string;
      date_dernier_ct: string;
      date_validite_ct: string;
      credit_card_accepted: boolean;
      electronic_toll: boolean;
      fresh_drink: boolean;
      pet_accepted: boolean;
      tablet: boolean;
      dvd_player: boolean;
      taximetre: string;
      every_destination: boolean;
      nfc_cc_accepted: boolean;
      baby_seat: boolean;
      special_need_vehicle: boolean;
      amex_accepted: boolean;
      gps: boolean;
      engine: string;
      cpam_conventionne: boolean;
      relais: boolean;
      bank_check_accepted: boolean;
      luxury: boolean;
      licence_plate: string;
      horse_power: number;
      model_year: number;
      wifi: boolean;
      type_: string;
      nb_seats: number;
      constructor: string;
      bike_accepted: boolean;
      model: string;
      vehicle_identification_number: string;
    },
  ];
}

export interface ITaxiPositionSnapShots {
  items: ITaxiPositionSnapShotItem[];
}

export interface ITaxiPositionSnapShotItem {
  timestamp: number;
  operator: string;
  taxi: string;
  lat: number | string;
  lon: number | string;
  device: string;
  status: string;
  version: string;
  speed: string;
  azimuth: number | string | boolean;
}

export interface ITaxiUpdate {
  data: [
    {
      status: string;
      private: boolean;
    },
  ];
}

export interface ITaxiReset {
  data: [
    {
      status: string;
      private: boolean;
    },
  ];
}

export interface ITaxiResponseDto {
  ads: {
    insee: string;
    numero: string;
  };
  driver: {
    departement: string;
    professional_licence: string;
  };
  position: {
    lat: number;
    lon: number;
  };
  vehicle: {
    characteristics: string[];
    color: string;
    constructor: string;
    licence_plate: string;
    model: string;
    nb_seats: number;
  };
  crowfly_distance: number;
  id: string;
  last_update: string | number;
  operator: string;
  private: boolean;
  rating: number;
  status: string;
}

interface IStreetAddress {
  streetAddress: string;
}

export interface IInquiryRequestDTO {
  from: {
    coordinates: ICoordinateDTO;
    physicalAddress?: IStreetAddress;
  };

  to: {
    coordinates: ICoordinateDTO;
    physicalAddress?: IStreetAddress;
  };

  useAssetTypes: AssetTypes[];

  operators?: string[];
}

export interface IInquiryResponseDTO {
  departureTime: string;
  arrivalTime: string; // Most by IsoString
  from: {
    coordinates: ICoordinateDTO;
    physicalAddress?: IStreetAddress;
  };
  to: {
    coordinates: ICoordinateDTO;
    physicalAddress?: IStreetAddress;
  };
}

export interface ICoordinateDTO {
  lat: any;
  lon: any;
}

export enum AssetTypes {
  Normal = "taxi-registry-standard",
  Mpv = "taxi-registry-minivan",
  SpecialNeed = "taxi-registry-special-need",
}
