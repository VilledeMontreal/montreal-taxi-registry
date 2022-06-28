// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { mtlMap } from 'config/mtlMap';

export const yellowIcon = {
  iconUrl: '../../assets/imagesLeaflet/taxiYellow.png',
  iconSize: [48, 48],
  iconAnchor: [24, 48]
};

export const taxiAreaIcon = {
  iconUrl: '../../assets/imagesLeaflet/taxi-area.png',
  iconSize: [14, 14],
  iconAnchor: [0, 14]
};

export const leftSideMenuOptions = {
  position: 'left',
  closeButton: true,
  autoPan: false
};

export const rightSideMenuOptions = {
  position: 'right',
  closeButton: true,
  autoPan: false
};

const center = mtlMap.center;
export const mapOptions = {
  center,
  maxZoom: mtlMap.maxZoom,
  minZoom: mtlMap.minZoom,
  zoom: mtlMap.zoom
};
