// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { environment } from "environments/environment";

// tslint:disable:max-line-length
declare var L: any;

export function getStamenTonerLayer() {
  return L.tileLayer(
    environment.rasterMaps,
    {
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }
  );
}
