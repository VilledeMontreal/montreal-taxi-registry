// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { defineCopyTemplate } from '../shared/copyTemplate/copyTemplate';
import { ITaxiPositionSnapShotItem, ITaxiPositionSnapShots } from '../shared/taxiRegistryDtos/taxiRegistryDtos';

export const copyTaxiPositionSnapShotItemTemplate = defineCopyTemplate<ITaxiPositionSnapShotItem>({
  timestamp: 0, // cannot be set by default
  operator: 'defaultOperator',
  taxi: 'ShouldbeSet',
  lat: 45.515151,
  lon: -73.585858,
  device: 'defaultDevice',
  status: 'free',
  version: '2',
  speed: '21',
  azimuth: '22'
});

export const copyTaxiPositionTemplate = defineCopyTemplate<ITaxiPositionSnapShots>({
  items: [copyTaxiPositionSnapShotItemTemplate()]
});
