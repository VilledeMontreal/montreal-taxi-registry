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
  phone_number_technical: string;
  role: string;
  role_name: string;
}
