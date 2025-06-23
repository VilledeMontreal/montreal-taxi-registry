// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
//
// Required to avoid following error:
// error TS2339: Property 'parse' does not exist on type 'typeof import("le-taxi-api-node.js/node_modules/@types/geojson/index")'
//
// TODO:
//  - make a pull-request with this change to DefinitelyTyped repo
//  - Ensure it is merged
//  - Upgrade @types/geojson to the newest (freshly merged) version
//  - Delete this code
//
namespace GeoJSON {
  function parse(
    objects: [] | object,
    params: object,
    /* eslint-disable @typescript-eslint/no-unsafe-function-type */
    callback?: Function
  ): any;
}
