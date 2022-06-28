// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface Driver {
  id: number;
  added_at: Date;
  added_via: string;
  source: string;
  last_update_at: Date;
  departement_id;

  added_by: number;
  birth_date: Date;
  first_name: string;
  last_name: string;
  professionnal_licence: string;

  //grid Fields
  added_By_name: string;
}
