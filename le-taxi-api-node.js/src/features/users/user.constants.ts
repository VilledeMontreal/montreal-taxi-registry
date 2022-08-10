// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export const getUsersCount = `SELECT COUNT(id) as count
  FROM public."user"
  WHERE public."user".active = true;
`;

export const disableUser = `UPDATE public."user" SET active = false WHERE public."user".id = $1::int`;

export const getRoles = `SELECT id, name FROM public.role`;

export const insertUserRole = `INSERT INTO public.roles_users (user_id, role_id) VALUES ($1::int, $2::int)`;

export const deleteUserRole = `DELETE FROM public.roles_users WHERE user_id = $1::int`;

export const updatePassword = `UPDATE public."user" SET password_v2 = $2::text WHERE id = $1::int`;

export const updateApikey = `UPDATE public."user" SET apikey_v2 = $2::text WHERE id = $1::int`;

export const getUserById = `SELECT
    u.id,
    u.email,
    u.active,
    u.public_id,
    u.confirmed_at,
    u.commercial_name,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.operator_api_key,
    u.operator_header_name,
    u.website_url,
    u.standard_booking_phone_number,
    u.standard_booking_website_url,
    u.standard_booking_android_deeplink_uri,
    u.standard_booking_android_store_uri,
    u.standard_booking_ios_deeplink_uri,
    u.standard_booking_ios_store_uri,
    u.standard_booking_is_promoted_to_public,
    u.standard_booking_inquiries_starts_at,
    u.minivan_booking_is_available_from_web_url,
    u.minivan_booking_is_available_from_android_uri,
    u.minivan_booking_is_available_from_ios_uri,
    u.minivan_booking_is_promoted_to_public,
    u.minivan_booking_inquiries_starts_at,
    u.special_need_booking_phone_number,
    u.special_need_booking_website_url,
    u.special_need_booking_android_deeplink_uri,
    u.special_need_booking_android_store_uri,
    u.special_need_booking_ios_deeplink_uri,
    u.special_need_booking_ios_store_uri,
    u.special_need_booking_is_promoted_to_public,
    u.special_need_booking_inquiries_starts_at,
    r.id as role,
    r.name as role_name
  FROM public."user" u
  LEFT OUTER JOIN public.roles_users ru ON ru.user_id = u.id
  LEFT OUTER JOIN public.role r ON r.id = ru.role_id
  WHERE u.id = $1::int
`;

export const getUserByApikey = `SELECT
    u.id,
    u.email,
    u.public_id,
    r.name as role_name,
    r.id as role,
    u.operator_api_key,
    u.operator_header_name,
    u.active,
    u.commercial_name,
    u.confirmed_at,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.website_url,
    u.standard_booking_phone_number,
    u.standard_booking_website_url,
    u.standard_booking_android_deeplink_uri,
    u.standard_booking_android_store_uri,
    u.standard_booking_ios_deeplink_uri,
    u.standard_booking_ios_store_uri,
    u.standard_booking_is_promoted_to_public,
    u.standard_booking_inquiries_starts_at,
    u.minivan_booking_is_available_from_web_url,
    u.minivan_booking_is_available_from_android_uri,
    u.minivan_booking_is_available_from_ios_uri,
    u.minivan_booking_is_promoted_to_public,
    u.minivan_booking_inquiries_starts_at,
    u.special_need_booking_phone_number,
    u.special_need_booking_website_url,
    u.special_need_booking_android_deeplink_uri,
    u.special_need_booking_android_store_uri,
    u.special_need_booking_ios_deeplink_uri,
    u.special_need_booking_ios_store_uri,
    u.special_need_booking_is_promoted_to_public,
    u.special_need_booking_inquiries_starts_at
  FROM public.user u
  INNER JOIN public.roles_users ru ON u.id = ru.user_id
  INNER JOIN public.role r ON r.id = ru.role_id
  WHERE u.apikey_v2 = $1::text
`;

export const getPromotedOperators = `SELECT
    u.id,
    u.email,
    u.public_id,
    r.name as role_name,
    r.id as role,
    u.operator_api_key,
    u.operator_header_name,
    u.active,
    u.commercial_name,
    u.confirmed_at,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.website_url,
    u.standard_booking_phone_number,
    u.standard_booking_website_url,
    u.standard_booking_android_deeplink_uri,
    u.standard_booking_android_store_uri,
    u.standard_booking_ios_deeplink_uri,
    u.standard_booking_ios_store_uri,
    u.standard_booking_is_promoted_to_public,
    u.standard_booking_inquiries_starts_at,
    u.minivan_booking_is_available_from_web_url,
    u.minivan_booking_is_available_from_android_uri,
    u.minivan_booking_is_available_from_ios_uri,
    u.minivan_booking_is_promoted_to_public,
    u.minivan_booking_inquiries_starts_at,
    u.special_need_booking_phone_number,
    u.special_need_booking_website_url,
    u.special_need_booking_android_deeplink_uri,
    u.special_need_booking_android_store_uri,
    u.special_need_booking_ios_deeplink_uri,
    u.special_need_booking_ios_store_uri,
    u.special_need_booking_is_promoted_to_public,
    u.special_need_booking_inquiries_starts_at
  FROM public.user u
  INNER JOIN public.roles_users ru ON u.id = ru.user_id
  INNER JOIN public.role r ON r.id = ru.role_id
  WHERE r.name = $1::text
  AND u.active = true
  AND u.public_id is not null
  AND (
    u.standard_booking_inquiries_starts_at <= $2
    OR u.minivan_booking_inquiries_starts_at <= $2
    OR u.special_need_booking_inquiries_starts_at <= $2
  )
`;

export const getUserForAuthentication = `SELECT
    u.id,
    u.email,
    u.active,
    u.public_id,
    u.apikey_v2 as apikey,
    u.commercial_name,
    u.password_v2 as password,
    u.confirmed_at,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.operator_header_name,
    u.operator_api_key,
    r.id as role,
    r.name as role_name
  FROM "user" u
  INNER JOIN roles_users ru ON ru.user_id = u.id
  INNER JOIN role r ON r.id = ru.role_id
  WHERE lower(u.email) = lower($1::text)
`;

export const getUsersByRole = `SELECT
    u.id,
    u.email,
    u.active,
    u.public_id,
    u.commercial_name,
    u.confirmed_at,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.operator_header_name,
    u.operator_api_key
  FROM "user" u
  INNER JOIN roles_users ru ON ru.user_id = u.id
  INNER JOIN role r ON ru.role_id = r.id
  WHERE r.name = $1::text
`;

export const getUsersPaginated = `SELECT
    u.id,
    u.email,
    u.active,
    u.public_id,
    u.confirmed_at,
    u.commercial_name,
    u.email_customer,
    u.email_technical,
    u.phone_number_technical,
    u.operator_api_key,
    u.operator_header_name,
    u.website_url,
    u.standard_booking_phone_number,
    u.standard_booking_website_url,
    u.standard_booking_android_deeplink_uri,
    u.standard_booking_android_store_uri,
    u.standard_booking_ios_deeplink_uri,
    u.standard_booking_ios_store_uri,
    u.standard_booking_is_promoted_to_public,
    u.standard_booking_inquiries_starts_at,
    u.minivan_booking_is_available_from_web_url,
    u.minivan_booking_is_available_from_android_uri,
    u.minivan_booking_is_available_from_ios_uri,
    u.minivan_booking_is_promoted_to_public,
    u.minivan_booking_inquiries_starts_at,
    u.special_need_booking_phone_number,
    u.special_need_booking_website_url,
    u.special_need_booking_android_deeplink_uri,
    u.special_need_booking_android_store_uri,
    u.special_need_booking_ios_deeplink_uri,
    u.special_need_booking_ios_store_uri,
    u.special_need_booking_is_promoted_to_public,
    u.special_need_booking_inquiries_starts_at,
    r.id as role,
    r.name as role_name
  FROM public."user" u
  LEFT OUTER JOIN public.roles_users ru ON ru.user_id = u.id
  LEFT OUTER JOIN public.role r ON r.id = ru.role_id
  %ORDER_BY_CLAUSE%
  LIMIT $2::int
  OFFSET ($1::int * $2::int);
`;

export const insertUser = `INSERT INTO public."user"(
  email,
  public_id,
  password_v2,
  active,
  confirmed_at,
  apikey_v2,
  commercial_name,
  email_customer,
  email_technical,
  phone_number_technical,
  operator_api_key,
  operator_header_name,
  website_url,
  standard_booking_phone_number,
  standard_booking_website_url,
  standard_booking_android_deeplink_uri,
  standard_booking_android_store_uri,
  standard_booking_ios_deeplink_uri,
  standard_booking_ios_store_uri,
  standard_booking_is_promoted_to_public,
  standard_booking_inquiries_starts_at,
  minivan_booking_is_available_from_web_url,
  minivan_booking_is_available_from_android_uri,
  minivan_booking_is_available_from_ios_uri,
  minivan_booking_is_promoted_to_public,
  minivan_booking_inquiries_starts_at,
  special_need_booking_phone_number,
  special_need_booking_website_url,
  special_need_booking_android_deeplink_uri,
  special_need_booking_android_store_uri,
  special_need_booking_ios_deeplink_uri,
  special_need_booking_ios_store_uri,
  special_need_booking_is_promoted_to_public,
  special_need_booking_inquiries_starts_at
  ) SELECT
    email,
    public_id,
    $2::text,
    active,
    confirmed_at,
    $3::text,
    commercial_name,
    email_customer,
    email_technical,
    phone_number_technical,
    operator_api_key,
    operator_header_name,
    website_url,
    standard_booking_phone_number,
    standard_booking_website_url,
    standard_booking_android_deeplink_uri,
    standard_booking_android_store_uri,
    standard_booking_ios_deeplink_uri,
    standard_booking_ios_store_uri,
    standard_booking_is_promoted_to_public,
    standard_booking_inquiries_starts_at,
    minivan_booking_is_available_from_web_url,
    minivan_booking_is_available_from_android_uri,
    minivan_booking_is_available_from_ios_uri,
    minivan_booking_is_promoted_to_public,
    minivan_booking_inquiries_starts_at,
    special_need_booking_phone_number,
    special_need_booking_website_url,
    special_need_booking_android_deeplink_uri,
    special_need_booking_android_store_uri,
    special_need_booking_ios_deeplink_uri,
    special_need_booking_ios_store_uri,
    special_need_booking_is_promoted_to_public,
    special_need_booking_inquiries_starts_at
  FROM json_populate_record (NULL::public."user", $1)
  RETURNING id;
`;

export const updateUser = `UPDATE public."user" SET (
  public_id,
  commercial_name,
  email_customer,
  email_technical,
  phone_number_technical,
  operator_api_key,
  operator_header_name,
  website_url,
  standard_booking_phone_number,
  standard_booking_website_url,
  standard_booking_android_deeplink_uri,
  standard_booking_android_store_uri,
  standard_booking_ios_deeplink_uri,
  standard_booking_ios_store_uri,
  standard_booking_is_promoted_to_public,
  standard_booking_inquiries_starts_at,
  minivan_booking_is_available_from_web_url,
  minivan_booking_is_available_from_android_uri,
  minivan_booking_is_available_from_ios_uri,
  minivan_booking_is_promoted_to_public,
  minivan_booking_inquiries_starts_at,
  special_need_booking_phone_number,
  special_need_booking_website_url,
  special_need_booking_android_deeplink_uri,
  special_need_booking_android_store_uri,
  special_need_booking_ios_deeplink_uri,
  special_need_booking_ios_store_uri,
  special_need_booking_is_promoted_to_public,
  special_need_booking_inquiries_starts_at
  ) = ( SELECT
    public_id,
    commercial_name,
    email_customer,
    email_technical,
    phone_number_technical,
    operator_api_key,
    operator_header_name,
    website_url,
    standard_booking_phone_number,
    standard_booking_website_url,
    standard_booking_android_deeplink_uri,
    standard_booking_android_store_uri,
    standard_booking_ios_deeplink_uri,
    standard_booking_ios_store_uri,
    standard_booking_is_promoted_to_public,
    standard_booking_inquiries_starts_at,
    minivan_booking_is_available_from_web_url,
    minivan_booking_is_available_from_android_uri,
    minivan_booking_is_available_from_ios_uri,
    minivan_booking_is_promoted_to_public,
    minivan_booking_inquiries_starts_at,
    special_need_booking_phone_number,
    special_need_booking_website_url,
    special_need_booking_android_deeplink_uri,
    special_need_booking_android_store_uri,
    special_need_booking_ios_deeplink_uri,
    special_need_booking_ios_store_uri,
    special_need_booking_is_promoted_to_public,
    special_need_booking_inquiries_starts_at
  FROM json_populate_record (NULL::public."user", $1))
  WHERE public."user".id = $2::int
  RETURNING id;
`;
