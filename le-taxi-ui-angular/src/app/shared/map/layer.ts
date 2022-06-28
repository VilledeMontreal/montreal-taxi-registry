// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// tslint:disable:max-line-length
declare var L: any;

export function getStamenTonerLayer() {
  return L.tileLayer(
    'https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}',
    {
      attribution:
        // tslint:disable-next-line:max-line-length
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }
  );
}
