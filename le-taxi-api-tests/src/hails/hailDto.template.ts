// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from '../shared/copyTemplate/copyTemplate';
import {
  IHail,
  IHailIncidentTaxiReason,
  IHailRating,
  IHailReportingCustomer,
  IHailStatus,
  IHailTaxiPhoneNumber
} from '../shared/taxiRegistryDtos/taxiRegistryDtos';

export const copyHailTemplate = defineCopyTemplate<IHail>({
  data: [
    {
      customer_lat: 0,
      customer_lon: 0,
      customer_address: 'defaultAddress',
      taxi_id: 'defaultTaxiId',
      customer_phone_number: 'defaultPhoneNumber',
      operateur: 'defaultOperator',
      customer_id: 'anonymous'
    }
  ]
});

export const copyHailStatusTemplate = defineCopyTemplate<IHailStatus>({
  data: [
    {
      status: 'defaultStatus'
    }
  ]
});

export const copyHailRatingTemplate = defineCopyTemplate<IHailRating>({
  data: [
    {
      rating_ride: null,
      rating_ride_reason: 'DefaultReason'
    }
  ]
});

export const copyHailReportingCustomer = defineCopyTemplate<IHailReportingCustomer>({
  data: [
    {
      reporting_customer: true,
      reporting_customer_reason: 'DefaultReason'
    }
  ]
});

export const copyHailTaxiPhoneNumber = defineCopyTemplate<IHailTaxiPhoneNumber>({
  data: [
    {
      taxi_phone_number: 'DefaultTaxiPhoneNumber'
    }
  ]
});

export const copyHailIncidentTaxiReason = defineCopyTemplate<IHailIncidentTaxiReason>({
  data: [
    {
      incident_taxi_reason: 'DefaultReason'
    }
  ]
});
