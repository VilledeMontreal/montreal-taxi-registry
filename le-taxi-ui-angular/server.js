var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var express = require('express');
var promClient = require('prom-client');
var promBundle = require('express-prom-bundle');
var source = 'dist';
var folder = process.env.FOLDER || '/';
var httpPort = 8070;

promClient.collectDefaultMetrics({ timeout: 10000 });
const metricsMiddleware = promBundle({ includeMethod: false, autoregister: false });

var app = express();

app.use(metricsMiddleware);

app.get('/diagnostics/v1/metrics', function (req, res, next) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(promClient.register.metrics());
});

app.get('/diagnostics/v1/ping', function (req, res, next) {
  res.contentType('text/plain');
  res.send('pong');
});

app.get('/diagnostics/v1/health/check', function (req, res, next) {
  res.sendStatus(200);
});


 app.use(folder, createRouter('/'));

function createRouter(basePath) {
  let htmlPage = fs.readFileSync(path.resolve(`./dist/index.html`), 'utf8');
  htmlPage = htmlPage.replace('<base href="/">', `<base href="${basePath}">`);
  var router = express.Router();

  router.get('/', function (req, res, next) {
    res.send(htmlPage);
  });

  router.use('/', express.static('dist', { redirect: false, maxAge: '30d' }));

  router.get('*', function (req, res, next) {
    res.send(htmlPage);
  });

  router.get('*', function (err, req, res, next) {
    console.error('*' + err.stack);
  });

  router.use(function (err, req, res, next) {
    console.error(err.stack);
  });

  return router;
}

var httpServer = http.createServer(app);
httpServer.listen(httpPort);
