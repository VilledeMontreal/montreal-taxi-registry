// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { ICoordinates } from '../../shared/coordinates/coordinates';

const serviceUnavailable = `<div>The operator has stated that they do not offer this service. If this is incorrect, please contact support.taxi.exchange.point@montreal.ca</div>`;

const eightyQueen = { lat: 45.497271007, lon: -73.554539698 };
const cityHall = { lat: 45.50891801, lon: -73.554333425 };
const airport = { lat: 45.465683693, lon: -73.74548144 };
const oldLongueuil = { lat: 45.538120632, lon: -73.51005992 };
const middleOfAngrignonParc = { lat: 45.441481488, lon: -73.603012772 };
const invalidLocation = { lat: null, lon: null };
const middleOfSaintLawrence = { lat: 45.432497149, lon: -73.538487531 };
const middleOfSaintLawrenceOther = { lat: 45.3989600111, lon: -73.81834255 };

export enum TaxiType {
  Standard = 'standard cab',
  Minivan = 'minivan',
  SpecialNeed = 'cab adapted to riders with capability issues'
}

export enum PlatformType {
  Web = 'website',
  Android = 'Android app',
  Ios = 'iOS app'
}

export interface IPhoneBookingOptions {
  taxiType: string;
  phoneNumber: string;
}

export interface IDeepLinkBookingOptions {
  taxiType: TaxiType;
  platformType: PlatformType;
  serviceType: string;
  bookingUrl: string;
  storeUrl?: string;
  display: boolean;
  displayTemplate?: boolean;
}

export function evaluatePhoneBooking(opts: IPhoneBookingOptions): string {
  if (!opts.phoneNumber) return serviceUnavailable;
  return `<div>Can book a ${opts.taxiType} by calling ${opts.phoneNumber}.</div>`;
}

export function evaluateBookingStandard(opts: IDeepLinkBookingOptions) {
  if (!opts.display) return serviceUnavailable;
  return `
<div>
  ${evaluateAppStore(opts)}
  <br>
  ${evaluateTemplate(opts)}
</div>
`;
}

export function evaluateBookingMinivan(opts: IDeepLinkBookingOptions): string {
  if (!opts.display) return serviceUnavailable;
  return `
<div>
  ${cityHallToEightyQueen(opts)}
</div>
`;
}

export function evaluateBookingSpecialNeed(opts: IDeepLinkBookingOptions): string {
  if (!opts.display) return serviceUnavailable;

  return `
<div>
${evaluateAppStore(opts)}
<br>
${cityHallToEightyQueen(opts)}
<br>
${opts.displayTemplate ? evaluateTemplate(opts) : ''}
</div>
`;
}

function evaluateAppStore(opts: IDeepLinkBookingOptions) {
  if (opts.platformType !== PlatformType.Android && opts.platformType !== PlatformType.Ios) return '';
  if (!opts.storeUrl) return `<div>No store URL</div>`;
  return `
<div>Can download the ${opts.platformType} to book a ${opts.taxiType} from the store:</div>
<div><a href='${opts.storeUrl}'>${opts.storeUrl}</a></div>
`;
}

function evaluateTemplate(opts: IDeepLinkBookingOptions) {
  if (!opts.bookingUrl) return serviceUnavailable;

  return `
<div>
  ${eightyQueenWithNoDestination(opts)}
  <br>
  ${eightyQueenToCityHall(opts)}
  <br>
  ${eightyQueenToAirport(opts)}
  <br>
  ${eightyQueenToOldLongueil(opts)}
  <br>
  ${eightyQueenToMiddleOfAngrignonParc(opts)}
  <br>
  ${middleOfAngrignonParcToEightyQueen(opts)}
  <br>
  ${eightyQueenToInvalidLocation(opts)}
  <br>
  ${invalidLocationToInvalidLocation(opts)}
  <br>
  ${invalidLocationToEightyQueen(opts)}
  <br>
  ${middleOfSaintLawrenceTomiddleOfSaintLawrenceOther(opts)}
</div>
`;
}

function cityHallToEightyQueen(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, cityHall, eightyQueen);
  return `
<div>Can book a ${opts.taxiType} with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function eightyQueenWithNoDestination(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen);
  const linkEmpty = `${link}&dropoff_latitude=&dropoff_longitude=`;
  const linkNull = `${link}&dropoff_latitude=null&dropoff_longitude=null`;

  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to no particular destination with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
<div><a href='${linkEmpty}'>${linkEmpty}</a></div>
<div><a href='${linkNull}'>${linkNull}</a></div>
`;
}

function eightyQueenToCityHall(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen, cityHall);
  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to another Montreal address (City Hall) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function eightyQueenToAirport(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen, airport);
  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to the airport with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function eightyQueenToOldLongueil(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen, oldLongueuil);
  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to an address in the ARTM zone (Old Longueuil) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function eightyQueenToMiddleOfAngrignonParc(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen, middleOfAngrignonParc);
  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to a Montreal location without an addressv (middle of Angrignon Parc) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function middleOfAngrignonParcToEightyQueen(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, middleOfAngrignonParc, eightyQueen);
  return `
<div>Can book a ${opts.taxiType} from a Montreal location without address (middle of Angrignon Parc) to a Montreal address (80 Queen) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function eightyQueenToInvalidLocation(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, eightyQueen, invalidLocation);
  return `
<div>Can book a ${opts.taxiType} from a Montreal address (80 Queen) to an unspecified location (null) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function invalidLocationToInvalidLocation(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, invalidLocation, invalidLocation);
  return `
<div>Can book a ${opts.taxiType} from an unspecified location (null) to an unspecified location (null) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function invalidLocationToEightyQueen(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, invalidLocation, eightyQueen);
  return `
<div>Can book a ${opts.taxiType} from a unspecified location (null) to a Montreal address (80 Queen) with the ${opts.platformType}:</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function middleOfSaintLawrenceTomiddleOfSaintLawrenceOther(opts: IDeepLinkBookingOptions) {
  const link = buildDeepLink(opts.bookingUrl, opts.serviceType, middleOfSaintLawrence, middleOfSaintLawrenceOther);
  return `
<div>The ${opts.platformType} tolerates booking a ${opts.taxiType} from an erroneous location (middle of Saint Lawrence) to an erroneous location (other middle of Saint Lawrence):</div>
<div><a href='${link}'>${link}</a></div>
`;
}

function buildDeepLink(baseUrl: string, serviceType: string, pickup: ICoordinates, dropoff?: ICoordinates): string {
  const deepLink = `${baseUrl}?service_type=${serviceType}&pickup_latitude=${pickup.lat}&pickup_longitude=${pickup.lon}`;
  return dropoff ? `${deepLink}&dropoff_latitude=${dropoff.lat}&dropoff_longitude=${dropoff.lon}` : deepLink;
}
