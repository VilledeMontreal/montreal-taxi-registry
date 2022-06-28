// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// tslint:disable: variable-name
export class UserModel {
  id: string;
  email: string;
  active: boolean;
  apikey: string;
  password: string;
  public_id: string;
  commercial_name: string;
  confirmed_at: string;
  email_customer: string;
  email_technical: string;
  hail_endpoint_production: string;
  phone_number_technical: string;
  operator_api_key: string;
  operator_header_name: string;
  role: number;
  role_name: string;
  is_hail_enabled: boolean;
  website_url: string;
  standard_booking_phone_number: string;
  standard_booking_website_url: string;
  standard_booking_android_deeplink_uri: string;
  standard_booking_android_store_uri: string;
  standard_booking_ios_deeplink_uri: string;
  standard_booking_ios_store_uri: string;
  standard_booking_is_promoted_to_public: boolean;
  standard_booking_inquiries_starts_at: string;
  minivan_booking_is_available_from_web_url: boolean;
  minivan_booking_is_available_from_android_uri: boolean;
  minivan_booking_is_available_from_ios_uri: boolean;
  minivan_booking_is_promoted_to_public: boolean;
  minivan_booking_inquiries_starts_at: string;
  special_need_booking_phone_number: string;
  special_need_booking_website_url: string;
  special_need_booking_android_deeplink_uri: string;
  special_need_booking_android_store_uri: string;
  special_need_booking_ios_deeplink_uri: string;
  special_need_booking_ios_store_uri: string;
  special_need_booking_is_promoted_to_public: boolean;
  special_need_booking_inquiries_starts_at: string;
}

// For any custom properties populated by us
// let typescript knows about it (thanks to declaration merging)
// tslint:disable: interface-name
declare global {
  namespace Express {
    interface Request {
      userModel: UserModel;
    }
  }
}
