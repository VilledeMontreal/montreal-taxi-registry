// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class ADSModel {
  constructor(
    insee?: string,
    numero?: string,
    owner_name?: string,
    owner_type?: string,
    category?: string,
    doublage?: boolean,
    vdm_vignette?: string
  ) {
    this.insee = insee;
    this.numero = numero;
    this.owner_name = owner_name;
    this.owner_type = owner_type;
    this.category = category;
    this.doublage = doublage;
    this.vehicle_id = null;
    this.vdm_vignette = vdm_vignette;
  }

  category: string;
  vehicle_id: string;
  insee: string;
  numero: string;
  owner_name: string;
  owner_type: string;
  doublage: boolean;
  vdm_vignette: string;
}
