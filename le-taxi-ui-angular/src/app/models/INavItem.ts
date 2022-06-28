// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface INavItem {
  nom: string;
  url: string;
  icon: string;
  sousMenu?: INavItem[];
  menuOpened?: boolean;
  active?: boolean;
}
