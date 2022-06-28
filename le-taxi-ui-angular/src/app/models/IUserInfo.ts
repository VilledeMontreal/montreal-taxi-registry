// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IUserInfo {
  id: string;
  email: string;
  active: boolean;
  apikey: string;
  commercial_name: string;
  password: string;
  confirmed_at: string;
  email_customer: string;
  email_technical: string;
  hail_endpoint_production: string;
  phone_number_technical: string;
  operator_api_key: string;
  operator_header_name: string;
  role: string;
  role_name: string;
  is_hail_enabled: boolean;
}
