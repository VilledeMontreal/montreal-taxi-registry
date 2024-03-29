// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiBaseUrl: 'https://taximtldev.accept.ville.montreal.qc.ca/api',
  uiBaseUrl: 'https://taximtldev.accept.ville.montreal.qc.ca',
  rasterMaps: 'https://api.dev.interne.montreal.ca/api/it-platforms/geomatic/raster-maps/v2/service/zxy/fond-de-carte/{z}/{x}/{y}'
};
