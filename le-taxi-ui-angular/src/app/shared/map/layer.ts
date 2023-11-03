// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// tslint:disable:max-line-length
declare var L: any;

export function getStamenTonerLayer() {
  return L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.{ext}',
    {
      attribution:
        // tslint:disable-next-line:max-line-length
        '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> <a href="https://stamen.com/" target="_blank">&copy; Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }
  );
}
