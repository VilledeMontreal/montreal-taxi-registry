// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class DepartementModel {
  constructor(nom?: string, numero?: string) {
    this.nom = nom;
    this.numero = numero;
  }

  nom: string;
  numero: string;
}
