// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class TaxiModel {
  id: string;
  added_at: string;
  added_via: string;
  added_by: string;
  source: string;
  last_update_at: string;
  vehicle_id: string;
  ads_id: string;
  driver_id: string;
  rating: string;
  ban_begin: string;
  ban_end: string;

  // for grid
  // ads
  numero: string;
  doublage: string;
  ads_added_at: string;
  ads_added_by: string;
  ads_last_update_at: string;
  insee: string;
  category: string;
  owner_name: string;
  owner_type: string;
  zupc_id: string;
  vdm_vignette: string;

  //driver
  licence_plate: string;
  first_name: string;
  last_name: string;
  professional_licence: string;

  //operateur
  added_By_name: string;
}
