// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { UserModel } from '../users/user.model';
import {
  evaluateBookingMinivan,
  evaluateBookingSpecialNeed,
  evaluateBookingStandard,
  evaluatePhoneBooking,
  PlatformType,
  TaxiType
} from './gtfsDeepLinks.templates';

class GtfsDeepLinksGenerator {
  public generateDeepLinksPage(user: UserModel): string {
    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GTFS-OnDemand URL scheme Acceptance Test</title>
</head>

<body>
  <h1>GTFS-OnDemand URL scheme Acceptance Test</h1>
  <div><h2>${user.commercial_name}<h2></div>
  <div><h3>Public ID: ${user.public_id}<h3></div>
  <div><strong>Important: </strong>To pass a test, the user should not have to re-enter the information provided through the GTFS-OnDemand URL scheme.</div>

  ${generatePhoneBooking(user)}
  ${generateWebBooking(user)}
  ${generateAndroidBooking(user)}
  ${generateIosBooking(user)}
</body>
</html>`;
  }
}

function generatePhoneBooking(user: UserModel): string {
  return `
<div>
  <h2>Phone<h2>
  <h3>Standard booking</h3>
    ${evaluatePhoneBooking({ taxiType: TaxiType.Standard, phoneNumber: user.standard_booking_phone_number })}
  <h3>Minivan booking</h3>
    ${evaluatePhoneBooking({ taxiType: TaxiType.Minivan, phoneNumber: user.standard_booking_phone_number })}
  <h3>Special need booking</h3>
    ${evaluatePhoneBooking({
      taxiType: TaxiType.SpecialNeed,
      phoneNumber: user.special_need_booking_phone_number
    })}
</div>`;
}

function generateWebBooking(user: UserModel): string {
  return `
<div>
  <h2>Web</h2>
  <h3>Standard booking</h3>
    ${evaluateBookingStandard({
      taxiType: TaxiType.Standard,
      platformType: PlatformType.Web,
      serviceType: `${user.public_id}-standard-route`,
      bookingUrl: user.standard_booking_website_url,
      display: !!user.standard_booking_website_url
    })}
  <h3>Minivan booking</h3>
    ${evaluateBookingMinivan({
      taxiType: TaxiType.Minivan,
      platformType: PlatformType.Web,
      serviceType: `${user.public_id}-minivan-route`,
      bookingUrl: user.standard_booking_website_url,
      display: !!user.minivan_booking_is_available_from_web_url
    })}
  <h3>Special need booking</h3>
    ${evaluateBookingSpecialNeed({
      taxiType: TaxiType.SpecialNeed,
      platformType: PlatformType.Web,
      serviceType: `${user.public_id}-special-need-route`,
      bookingUrl: user.special_need_booking_website_url,
      display: !!user.special_need_booking_website_url,
      displayTemplate: user.standard_booking_website_url !== user.special_need_booking_website_url
    })}
</div>`;
}

function generateAndroidBooking(user: UserModel): string {
  return `
<div>
  <h2>Android booking</h2>
  <h3>Standard booking</h3>
    ${evaluateBookingStandard({
      taxiType: TaxiType.Standard,
      platformType: PlatformType.Android,
      serviceType: `${user.public_id}-standard-route`,
      bookingUrl: user.standard_booking_android_deeplink_uri,
      storeUrl: user.standard_booking_android_store_uri,
      display: !!user.standard_booking_android_deeplink_uri
    })}
  <h3>Minivan booking</h3>
    ${evaluateBookingMinivan({
      taxiType: TaxiType.Minivan,
      platformType: PlatformType.Android,
      serviceType: `${user.public_id}-minivan-route`,
      bookingUrl: user.standard_booking_android_deeplink_uri,
      display: !!user.minivan_booking_is_available_from_android_uri
    })}
  <h3>Special need booking</h3>
  ${evaluateBookingSpecialNeed({
    taxiType: TaxiType.SpecialNeed,
    platformType: PlatformType.Android,
    serviceType: `${user.public_id}-special-need-route`,
    bookingUrl: user.special_need_booking_android_deeplink_uri,
    storeUrl: user.special_need_booking_android_store_uri,
    display: !!user.special_need_booking_android_deeplink_uri,
    displayTemplate: user.standard_booking_android_deeplink_uri !== user.special_need_booking_android_deeplink_uri
  })}
</div>`;
}

function generateIosBooking(user: UserModel): string {
  return `
<div>
  <h2>iOS booking</h2>
  <h3>Standard booking</h3>
  ${evaluateBookingStandard({
    taxiType: TaxiType.Standard,
    platformType: PlatformType.Ios,
    serviceType: `${user.public_id}-standard-route`,
    bookingUrl: user.standard_booking_ios_deeplink_uri,
    storeUrl: user.standard_booking_ios_store_uri,
    display: !!user.standard_booking_ios_deeplink_uri
  })}
  <h3>Minivan booking</h3>
  ${evaluateBookingMinivan({
    taxiType: TaxiType.Minivan,
    platformType: PlatformType.Ios,
    serviceType: `${user.public_id}-minivan-route`,
    bookingUrl: user.standard_booking_ios_deeplink_uri,
    display: !!user.minivan_booking_is_available_from_ios_uri
  })}
  <h3>Special need booking</h3>
  ${evaluateBookingSpecialNeed({
    taxiType: TaxiType.SpecialNeed,
    platformType: PlatformType.Ios,
    serviceType: `${user.public_id}-special-need-route`,
    bookingUrl: user.special_need_booking_ios_deeplink_uri,
    storeUrl: user.special_need_booking_ios_store_uri,
    display: !!user.special_need_booking_ios_deeplink_uri,
    displayTemplate: user.standard_booking_ios_deeplink_uri !== user.special_need_booking_ios_deeplink_uri
  })}
</div>`;
}

export const gtfsDeepLinksGenerator = new GtfsDeepLinksGenerator();
