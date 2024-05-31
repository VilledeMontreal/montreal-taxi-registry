// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { FeatureCollection } from 'geojson';
import * as _ from 'lodash';
import { locationsGeoJson } from '../shared/locations/locations';
import {
  GofsLiteCalendarsResponseDto,
  GofsLiteOperatingRulesResponseDto,
  GofsLiteServiceBrandsResponseDto,
  GofsLiteSupportedLangTypes,
  GofsLiteSystemInformationResponseDto,
  GofsLiteZoneResponseDto
} from './gofsLite.dto';

export function serviceBrandsFunc(lang: GofsLiteSupportedLangTypes): GofsLiteServiceBrandsResponseDto {
  return {
    service_brands: [
      {
        brand_id: 'taxi-registry-standard',
        brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi régulier' : 'Standard taxi'
      },
      {
        brand_id: 'taxi-registry-minivan',
        brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi fourgonnette' : 'Minivan taxi'
      },
      {
        brand_id: 'taxi-registry-special-need',
        brand_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Taxi adapté' : 'Accessible taxi'
      }
    ]
  };
}

export function systemInformationFunc(lang: GofsLiteSupportedLangTypes): GofsLiteSystemInformationResponseDto {
  return {
    language: lang as GofsLiteSupportedLangTypes,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    name: lang === GofsLiteSupportedLangTypes.Fr ? 'Registre des taxis de Montréal' : 'Montreal taxi registry',
    short_name: lang === GofsLiteSupportedLangTypes.Fr ? 'Registre des taxis' : 'Taxi registry'
  };
}

export function zonesFunc(lang: GofsLiteSupportedLangTypes): GofsLiteZoneResponseDto {
  return {
    zones: lang === GofsLiteSupportedLangTypes.Fr ? locationsGeoJson : patchLocationsInEnglish(locationsGeoJson)
  };
}

function patchLocationsInEnglish(locations: FeatureCollection): FeatureCollection {
  const locationsEn = _.cloneDeep(locations);
  locationsEn.features[0].properties.name = 'Montréal-Trudeau International Airport';
  locationsEn.features[0].properties.description =
    'The airport is subject to federal jurisdiction that prevents the Taxi Registry to honour ride request from the airport';
  locationsEn.features[1].properties.name = 'Jurisdiction of the Autorité régionale de transport métropolitain';
  locationsEn.features[1].properties.description = `Longueuil Urban Area, Beauharnois-Salaberry MRC, Deux-Montagnes MRC, L'Assomption MRC, Rivière-du-Nord MRC, Vallée-du-Richelieu MRC, Moulins MRC, Marguerite-D'Youville MRC, Roussillon MRC, Rouville MRC, Thérèse-De Blainville MRC, Vaudreuil-Soulanges MRC, City of Laval, City of Mirabel.`;
  return locationsEn;
}

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
};

export const calendars: GofsLiteCalendarsResponseDto = {
  calendars: [
    {
      calendar_id: 'all-days',
      start_date: '20230101',
      end_date: '21230101'
    }
  ]
};
