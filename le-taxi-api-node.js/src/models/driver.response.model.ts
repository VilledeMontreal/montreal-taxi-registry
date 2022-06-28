// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DepartementModel } from '../models/departement.model';
export class DriverModel {
  constructor(
    birth_date: string,
    departement: DepartementModel,
    first_name: string,
    last_name: string,
    professional_licence: string
  ) {
    this.birth_date = birth_date;
    this.departement = departement;
    this.first_name = first_name;
    this.last_name = last_name;
    this.professional_licence = professional_licence;
  }

  birth_date: string;
  departement: DepartementModel;
  first_name: string;
  last_name: string;
  professional_licence: string;
}
