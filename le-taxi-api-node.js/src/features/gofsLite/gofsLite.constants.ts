// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { locationsGeoJson } from "../shared/locations/locations";
import { GofsLiteCalendarsResponseDto, GofsLiteOperatingRulesResponseDto, GofsLiteServiceBrandsResponseDto, GofsLiteSupportedLangTypes, GofsLiteSystemInformationResponseDto, GofsLiteZoneResponseDto } from "./gofsLite.dto";

export function serviceBrandsFunc(lang: GofsLiteSupportedLangTypes): GofsLiteServiceBrandsResponseDto {
    return {
      service_brands: [
        {
          brand_id: 'taxi-registry-standard',
          brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi régulier' : 'Taxi standard'
        }, {
          brand_id: 'taxi-registry-minivan',
          brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi fourgonnette' : 'Taxi minivan'
        }, {
          brand_id: 'taxi-registry-special-need',
          brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi adapté' : 'Taxi special need'
        },
      ]
    }
};

export function systemInformationFunc(lang: GofsLiteSupportedLangTypes): GofsLiteSystemInformationResponseDto {
  return {
    language: lang as GofsLiteSupportedLangTypes,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    name: lang === GofsLiteSupportedLangTypes.Fr ? 'Registre des taxis de Montréal' : 'Montreal taxi registry',
    short_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Registre des taxis' : 'Taxi registry',
  }
}

export const zones: GofsLiteZoneResponseDto = {
  zones: locationsGeoJson
};

export const operatingRules: GofsLiteOperatingRulesResponseDto = {
  operating_rules: [
    {
      from_zone_id: 'artm',
      to_zone_id: 'artm',
      calendars: ['all-days'],
      vehicle_type_id: []
    },
    {
      from_zone_id: 'artm',
      to_zone_id: 'airport',
      calendars: ['all-days'],
      vehicle_type_id: []
    }
  ]
}

export const calendars: GofsLiteCalendarsResponseDto = {
  calendars: [
    {
      calendar_id: 'all-days',
      start_date: '20230101',
      end_date: '21230101'
    }
  ]
}