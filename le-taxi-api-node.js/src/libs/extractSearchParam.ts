// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import express = require('express');

function extractSearchParam(req: express.Request): string {
  const specialNeedVehicle = 'special-need-vehicle';
  if (req.query[specialNeedVehicle]) {
    return specialNeedVehicle;
  }

  if (req.query.vehicleType === 'mpv') {
    return 'mpv';
  }
  return '';
}

export { extractSearchParam };