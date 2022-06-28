// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as core from 'express-serve-static-core';
import { configs } from '../../config/configs';
import { buildDiagnosticsEndpoint } from '../shared/utils/apiUtils';

const promBundle = require('express-prom-bundle');

export function initializeMetrics(app: core.Express) {
  const collectDefaultMetrics = promBundle.promClient.collectDefaultMetrics;
  collectDefaultMetrics({ timeout: 1000 }); // every ms
  const defaultNormalizePath = promBundle.normalizePath;
  promBundle.normalizePath = (req, opts) => {
    const path: string = defaultNormalizePath(req, opts);
    const endpoint = path.includes(configs.api.domainPath) ? path.match(`${configs.api.domainPath}(.*)`)[1] : path;

    if (!endpoint || endpoint === '/') return '/';
    const matchFirstLevelOnly = /^\/[^\/\?]+/;
    if (!endpoint.startsWith('/api')) return `${endpoint.match(matchFirstLevelOnly)[0]}*`;

    if (endpoint.match(/^\/api\/worker\/hail-anonymization-tasks.*/)) return '/api/worker/hail-anonymization-tasks*';
    const matchApiAndSecondLevelOnly = /^\/api\/[^\/\?]+/;
    return `${endpoint.match(matchApiAndSecondLevelOnly)}*`;
  };

  const metricsMiddleware = promBundle({
    includeStatusCode: true,
    includeMethod: true,
    includePath: true,
    autoregister: true
  });

  app.use(metricsMiddleware);

  addMetricsRoute(app, buildDiagnosticsEndpoint('/v1/operator-and-motor-metrics'));
  addMetricsRoute(app, buildDiagnosticsEndpoint('/v1/geo-server-metrics'));
  addMetricsRoute(app, buildDiagnosticsEndpoint('/v1/data-dump-and-ui-metrics'));

  addPingRoute(app, buildDiagnosticsEndpoint('/v1/operator-and-motor-ping'));
  addPingRoute(app, buildDiagnosticsEndpoint('/v1/geo-server-ping'));
  addPingRoute(app, buildDiagnosticsEndpoint('/v1/data-dump-and-ui-ping'));
}

function addMetricsRoute(app: core.Express, route: string) {
  app.get(route, async (req, res, next) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(await promBundle.promClient.register.metrics());
  });
}

function addPingRoute(app: core.Express, route: string) {
  app.get(route, (req, res, next) => {
    res.contentType('text/plain');
    res.send('pong');
  });
}
