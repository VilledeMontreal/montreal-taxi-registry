// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { configs } from '../../config/configs';
import { TaxiSummaryModelExtended } from '../latestTaxiPositions/latestTaxiPosition.model';
import { latestTaxiPositionRepository } from '../latestTaxiPositions/latestTaxiPosition.repository';
import { osrmRepository } from '../shared/osrm/osrm.repository';
import { userRepositoryByIdWithCaching } from '../users/user.repositoryWithCaching';
import { InquiryRequest, InquiryResponse } from './inquiry.dto';

interface IInquiryResponseParams {
  now: string;
  from: any;
  to: any;
  taxi: TaxiSummaryModelExtended;
  waitDuration: number,
  tripDuration: number;
}

class InquiryProcessor {
  public async process(inquiryRequest: InquiryRequest): Promise<InquiryResponse> {
    const closestTaxiPromise = latestTaxiPositionRepository.findClosestTaxis(
      inquiryRequest.from,
      inquiryRequest.inquiryTypes,
      inquiryRequest.operators
    );
    const routeFromSourceToDestinationPromise = inquiryRequest.to ?
      osrmRepository.getRoutes(inquiryRequest.from, inquiryRequest.to) :
      [];

    const [closestTaxis, routeFromSourceToDestination] = await Promise.all([
      closestTaxiPromise,
      routeFromSourceToDestinationPromise
    ]);

    if (!closestTaxis.length) return null;

    const routesFromTaxiPositionToCustomer = await osrmRepository.getTable(
      inquiryRequest.from,
      closestTaxis.map(closestTaxi => ({
        lat: closestTaxi.lat,
        lon: closestTaxi.lon
      }))
    );

    const data = await Promise.all(closestTaxis.map(async (closestTaxi, i) => ({
      inquiryType: closestTaxi.taxi.inquiryType,
      operator: await userRepositoryByIdWithCaching.getByKey(closestTaxi.taxi.operatorId),
      from: inquiryRequest.from,
      to: inquiryRequest.to,
      estimatedWaitTime: routesFromTaxiPositionToCustomer[0][i] +
        configs.taxiRegistryOsrmApi.estimation.biasInSec +
        configs.taxiRegistryOsrmApi.estimation.requestAndDispatchInSec,
      estimatedTravelTime: routeFromSourceToDestination[0].legs[0].duration + configs.taxiRegistryOsrmApi.estimation.biasInSec,
    })));

    return { data };
  }
}

export const inquiryProcessor = new InquiryProcessor();
