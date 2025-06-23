// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// eslint-disable max-classes-per-file
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  IsUUID,
} from "class-validator";

const isUrlOptions = { allow_underscores: true };

export class UserRequestDto {
  @IsOptional()
  @IsInt()
  id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEmpty()
  password: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;

  confirmed_at: string;

  @IsEmpty()
  apikey: string;

  @IsDefined()
  @IsNotEmpty()
  commercial_name: string;

  @IsOptional()
  @IsEmail()
  email_customer: string;

  @IsOptional()
  @IsEmail()
  email_technical: string;

  @IsOptional()
  @IsPhoneNumber("US")
  phone_number_technical: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  website_url: string;

  @IsOptional()
  @IsPhoneNumber("US")
  standard_booking_phone_number: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  standard_booking_website_url: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  standard_booking_android_deeplink_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  standard_booking_android_store_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  standard_booking_ios_deeplink_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  standard_booking_ios_store_uri: string;

  @IsOptional()
  @IsBoolean()
  standard_booking_is_promoted_to_public: boolean;

  standard_booking_inquiries_starts_at: string;

  @IsOptional()
  @IsBoolean()
  minivan_booking_is_available_from_web_url: boolean;

  @IsOptional()
  @IsBoolean()
  minivan_booking_is_available_from_android_uri: boolean;

  @IsOptional()
  @IsBoolean()
  minivan_booking_is_available_from_ios_uri: boolean;

  @IsOptional()
  @IsBoolean()
  minivan_booking_is_promoted_to_public: boolean;

  minivan_booking_inquiries_starts_at: string;

  @IsOptional()
  @IsPhoneNumber("US")
  special_need_booking_phone_number: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  special_need_booking_website_url: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  special_need_booking_android_deeplink_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  special_need_booking_android_store_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  special_need_booking_ios_deeplink_uri: string;

  @IsOptional()
  @IsUrl(isUrlOptions)
  special_need_booking_ios_store_uri: string;

  @IsOptional()
  @IsBoolean()
  special_need_booking_is_promoted_to_public: boolean;

  special_need_booking_inquiries_starts_at: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  role: number;

  @IsOptional()
  @IsUUID()
  public_id: string;
}
