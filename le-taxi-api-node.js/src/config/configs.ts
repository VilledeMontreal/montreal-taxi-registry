// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as config from 'config';
import * as _ from 'lodash';
import * as path from 'path';
import { ConfigCache } from '../utils/configs/configCache';
import { constants } from './constants';

let message = `\n------------------------------------\n`;
message += `Configuration files loaded:\n`;
const sources = config.util.getConfigSources();
for (const source of sources) {
  message += `- ${source.name}\n`;
}
message += `------------------------------------\n`;
// tslint:disable-next-line:no-console
console.log(message);

/**
 * Configurations for the application.
 */
export class Configs {
  private static theInstance: Configs;

  /**
   * Absolute path to the root of the project.
   */
  public root: string;

  // ==========================================
  // The environment name is found by node-config. It will
  // use the "NODE_ENV" environment variable or fallback to
  // "development" if not found.
  // @see https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
  // ==========================================
  private theEnvironment: string;
  private theEnvironmentInstance: string;

  private cache: ConfigCache;

  private constructor() {
    this.root = path.normalize(`${__dirname}/..`);
    this.theEnvironment = config.util.getEnv(constants.EnvVariables.NODE_ENV);
    this.theEnvironmentInstance = config.util.getEnv(constants.EnvVariables.NODE_APP_INSTANCE);
    this.cache = new ConfigCache();
  }

  /**
   * Singleton
   */
  static get instance(): Configs {
    if (!this.theInstance) {
      this.theInstance = new Configs();
    }
    return this.theInstance;
  }

  /**
   * Current environment info.
   */
  get environment() {
    return {
      displayText: this.theEnvironmentInstance
        ? `${this.theEnvironmentInstance}@${this.theEnvironment}`
        : this.theEnvironment,
      type: this.theEnvironment,
      instance: this.theEnvironmentInstance,
      isLocal: this.cache.get<boolean>('environment.isLocal'),
      isDev: this.theEnvironment === constants.Environments.DEV,
      isLocalOrDev:
        this.cache.get<boolean>('environment.isLocal') || this.theEnvironment === constants.Environments.DEV,
      isAcc: this.theEnvironment === constants.Environments.ACC,
      isProd: this.theEnvironment === constants.Environments.PROD
    };
  }

  /**
   * API informations
   */
  get api() {
    return {
      /**
       * The public scheme the API will be accessible from.
       * This is going to be used, for example, by Swagger UI.
       */
      scheme: this.cache.get<string>('api.scheme'),

      /**
       * The public host the API will be accessible from.
       * This is going to be used, for example, by Swagger UI.
       */
      host: this.cache.get<string>('api.host'),

      /**
       * The public port the API will be accessible from.
       * This is going to be used, for example, by Swagger UI.
       */
      port: this.cache.get<number>('api.port'),

      /**
       * The common path under which all routes of this API
       * are served. Represents the business domain for which the API
       * is created.
       *
       * The full path to an endpoint consists in a variable endpoint type root,
       * followed by this common domain path, followed by the relative path
       * specific to the endpoint.
       *
       * Always starts with a "/".
       */
      domainPath: this.cache.get<string>('api.domainPath', (rawVal: string): string => {
        let reVal = `/${_.trim(rawVal, '/')}`;
        if (reVal === '/') {
          reVal = '';
        }
        return reVal;
      })
    };
  }

  /**
   * Routing info
   */
  get routing() {
    return {
      /**
       * Should the routing be case-sensitive?
       */
      caseSensitive: this.cache.get<boolean>('routing.caseSensitive'),

      /**
       * The maximum number of Mb a request
       * can have. Over that limit, an error is automatically
       * returned to the client.
       */
      maxRequestSizeMb: this.cache.get<number>('routing.maxRequestSizeMb', (rawVal: number): number => {
        let reVal: number = rawVal;

        if (!reVal || isNaN(reVal)) {
          reVal = 50;
        }

        return reVal;
      }),

      /**
       * Various endpoint specific *relative* paths. Those needs to be
       * prefixed with the endpoint type root and the domain path to
       * get a "full" path.
       */
      routes: {
        openAPI: {
          specsFile: this.cache.get<string>('routing.routes.openAPI.specsFile', (rawVal: string): string => {
            const reVal = rawVal;
            return _.trim(reVal, '/');
          }),

          ui: this.cache.get<string>('routing.routes.openAPI.ui', (rawVal: string): string => {
            const reVal = rawVal;
            return _.trim(reVal, '/');
          }),

          editor: this.cache.get<string>('routing.routes.openAPI.editor', (rawVal: string): string => {
            const reVal = rawVal;
            return _.trim(reVal, '/');
          })
        },
        diagnostics: {
          ping: this.cache.get<string>('routing.routes.diagnostics.ping'),
          info: this.cache.get<string>('routing.routes.diagnostics.info'),
          metrics: this.cache.get<string>('routing.routes.diagnostics.metrics'),
          healthCheck: this.cache.get<string>('routing.routes.diagnostics.healthCheck'),
          healthReport: this.cache.get<string>('routing.routes.diagnostics.healthReport')
        },
        rootDiagnostics: {
          ping: this.cache.get<string>('routing.routes.rootDiagnostics.ping'),
          info: this.cache.get<string>('routing.routes.rootDiagnostics.info'),
          metrics: this.cache.get<string>('routing.routes.rootDiagnostics.metrics')
        }
      }
    };
  }

  /**
   * Data sources info
   */
  get dataSources() {
    return {
      mongo: {
        host1: this.cache.get<string>('dataSources.mongo.host1'),
        host2: this.cache.get<string>('dataSources.mongo.host2'),
        host3: this.cache.get<string>('dataSources.mongo.host3'),
        port: this.cache.get<number>('dataSources.mongo.port'),
        username: this.cache.get<string>('dataSources.mongo.username'),
        password: this.cache.get<string>('dataSources.mongo.password'),
        defaultauthdb: this.cache.get<string>('dataSources.mongo.defaultauthdb'),
        options: this.cache.get<string>('dataSources.mongo.options'),
        poolSize: this.cache.get<number>('dataSources.mongo.poolSize')
      },
      postgres: {
        host: this.cache.get<string>('dataSources.postgres.host'),
        port: this.cache.get<number>('dataSources.postgres.port'),
        database: this.cache.get<string>('dataSources.postgres.database'),
        user: this.cache.get<string>('dataSources.postgres.user'),
        password: this.cache.get<string>('dataSources.postgres.password'),
        maxClient: this.cache.get<number>('dataSources.postgres.maxClient'),
        idleTimeoutMs: this.cache.get<number>('dataSources.postgres.idleTimeoutMs')
      },
      taxiEstimate: {
        host: this.cache.get<string>('dataSources.taxiEstimate.host'),
        apikey: this.cache.get<string>('dataSources.taxiEstimate.apikey'),
        postgres: {
          host: this.cache.get<string>('dataSources.taxiEstimate.postgres.host'),
          port: this.cache.get<number>('dataSources.taxiEstimate.postgres.port'),
          database: this.cache.get<string>('dataSources.taxiEstimate.postgres.database'),
          user: this.cache.get<string>('dataSources.taxiEstimate.postgres.user'),
          password: this.cache.get<string>('dataSources.taxiEstimate.postgres.password')
        }
      }
    };
  }

  /**
   * Taxi Config
   */
  get taxiAreas() {
    return {
      openDataUrl: this.cache.get<string>('taxiAreas.openDataUrl')
    };
  }
  get caching() {
    return {
      taxisMaxAgeInSec: this.cache.get<number>('caching.taxisMaxAgeInSec'),
      usersMaxAgeInSec: this.cache.get<number>('caching.usersMaxAgeInSec')
    };
  }
  get inquiries() {
    return {
      promotionDelayInSec: this.cache.get<number>('inquiries.promotionDelayInSec'),
      fixedDailyPriceDowntownToAirport: this.cache.get<number>('inquiries.fixedDailyPriceDowntownToAirport'),
      fixedNightlyPriceDowntownToAirport: this.cache.get<number>('inquiries.fixedNightlyPriceDowntownToAirport'),
      searchDistance: {
        standard: this.cache.get<number>('inquiries.searchDistance.standard'),
        minivan: this.cache.get<number>('inquiries.searchDistance.minivan'),
        specialNeed: this.cache.get<number>('inquiries.searchDistance.specialNeed')
      }
    };
  }

  /**
   * Taxi Registry OSRM API informations
   */
  get taxiRegistryOsrmApi() {
    return {
      base: this.cache.get<string>('taxiRegistryOsrmApi.base'),
      domainPath: this.cache.get<string>('taxiRegistryOsrmApi.domainPath'),
      estimation: {
        requestAndDispatchInSec: this.cache.get<number>('taxiRegistryOsrmApi.estimation.requestAndDispatchInSec'),
        durationBias: this.cache.get<number>('taxiRegistryOsrmApi.estimation.durationBias'),
        durationDailyRateRatio: this.cache.get<number>('taxiRegistryOsrmApi.estimation.durationDailyRateRatio'),
        durationNightlyRateRatio: this.cache.get<number>('taxiRegistryOsrmApi.estimation.durationNightlyRateRatio'),
        distanceBias: this.cache.get<number>('taxiRegistryOsrmApi.estimation.distanceBias'),
        distanceDailyRateRatio: this.cache.get<number>('taxiRegistryOsrmApi.estimation.distanceDailyRateRatio'),
        distanceNightlyRateRatio: this.cache.get<number>('taxiRegistryOsrmApi.estimation.distanceNightlyRateRatio'),
        dailyCompensationRate: this.cache.get<number>('taxiRegistryOsrmApi.estimation.dailyCompensationRate'),
        nightlyCompensationRate: this.cache.get<number>('taxiRegistryOsrmApi.estimation.nightlyCompensationRate')
      }
    };
  }

  /**
   * API_KEYS informations
   */
  get apikeys() {
    return {
      admin: this.cache.get<string>('apikeys.admin'),
      inspecteur: this.cache.get<string>('apikeys.inspecteur'),
      gestion: this.cache.get<string>('apikeys.gestion'),
      moteur: this.cache.get<string>('apikeys.moteur'),
      operateur: this.cache.get<string>('apikeys.operateur'),
      stats: this.cache.get<string>('apikeys.stats')
    };
  }

  /**
   * Security informations
   */
  get security() {
    return {
      jwt: this.cache.get<string>('security.jwt'),
      secret: this.cache.get<string>('security.secret'),
      adminUser: this.cache.get<string>('security.adminUser')
    };
  }
}

export let configs: Configs = Configs.instance;
