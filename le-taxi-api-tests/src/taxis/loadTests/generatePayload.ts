// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { generateSouthShoreLat, generateSouthShoreLon } from '../../shared/commonLoadTests/specialRegion';
import { IInquirySharedState } from './IInquirySharedState';

console.log('WARNING: ALL LOAD TESTS MUST BE EXECUTED WITH A SINGLE REPLICA PER DEPLOYMENT!');

const sharedStateJson = require('fs').readFileSync('src/taxis/loadTests/inquiry.sharedState.json');

export const sharedState: IInquirySharedState = JSON.parse(sharedStateJson);

export function generateStandardPayloadInquiry(context: any, ee: any, next: any) {
  return generatePayloadInquiry(context, ee, next, 'taxi-registry-standard-route');
}

export function generateSpecialNeedPayloadInquiry(context: any, ee: any, next: any) {
  return generatePayloadInquiry(context, ee, next, 'taxi-registry-special-need-route');
}

function generatePayloadInquiry(context: any, ee: any, next: any, assetType: string) {
  context.vars.apikey = sharedState.searchMotor.apiKey;
  context.vars.body = {
    from: {
      coordinates: {
        lat: generateSouthShoreLat(),
        lon: generateSouthShoreLon()
      }
    },
    to: {
      coordinates: {
        lat: generateSouthShoreLat(),
        lon: generateSouthShoreLon()
      }
    },
    useAssetTypes: [assetType]
  };
  return next();
}
