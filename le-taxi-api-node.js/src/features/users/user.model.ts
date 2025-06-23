// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// eslint-disable variable-name
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
  phone_number_technical: string;
  role: number;
  role_name: string;
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

type BaseUserModel =
  | "id"
  | "email"
  | "active"
  | "public_id"
  | "confirmed_at"
  | "commercial_name"
  | "email_customer"
  | "email_technical"
  | "phone_number_technical";

type OperatorUserModel =
  | "website_url"
  | "standard_booking_phone_number"
  | "standard_booking_website_url"
  | "standard_booking_android_deeplink_uri"
  | "standard_booking_android_store_uri"
  | "standard_booking_ios_deeplink_uri"
  | "standard_booking_ios_store_uri"
  | "standard_booking_is_promoted_to_public"
  | "standard_booking_inquiries_starts_at"
  | "minivan_booking_is_available_from_web_url"
  | "minivan_booking_is_available_from_android_uri"
  | "minivan_booking_is_available_from_ios_uri"
  | "minivan_booking_is_promoted_to_public"
  | "minivan_booking_inquiries_starts_at"
  | "special_need_booking_phone_number"
  | "special_need_booking_website_url"
  | "special_need_booking_android_deeplink_uri"
  | "special_need_booking_android_store_uri"
  | "special_need_booking_ios_deeplink_uri"
  | "special_need_booking_ios_store_uri"
  | "special_need_booking_is_promoted_to_public"
  | "special_need_booking_inquiries_starts_at";

type RoleUserModel = "role" | "role_name";

type AuthenticationUserModel = "apikey" | "password";

export type BaseUser = Pick<UserModel, BaseUserModel>;
export type AuthenticatedUser = Pick<
  UserModel,
  BaseUserModel | RoleUserModel | AuthenticationUserModel
>;
export type PromotedOperator = Pick<
  UserModel,
  BaseUserModel | RoleUserModel | OperatorUserModel
>;

// For any custom properties populated by us
// let typescript knows about it (thanks to declaration merging)
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      userModel: UserModel;
    }
  }
}
