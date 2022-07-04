// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as config from 'config';
import * as path from 'path';
import { ConfigCache } from './configCache';
import { constants } from './constants';

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
   * End To End testing informations
   */
  get e2eTesting() {
    return {
      maxTestConcurrency: this.cache.get<number>('e2eTesting.maxTestConcurrency')
    };
  }

  /**
   * Api tests informations
   */
  get apiTests() {
    return {
      rootApiKey: this.cache.get<string>('apiTests.rootApiKey'),
      user: this.cache.get<string>('apiTests.user'),
      password: this.cache.get<string>('apiTests.password')
    };
  }

  /**
   * Hails informations
   */
  get hails() {
    return {
      delayToReachStatusReceived_by_operatorInSec: this.cache.get<number>(
        'hails.delayToReachStatusReceived_by_operatorInSec'
      ),
      delayToComputeTaxiRatingInSec: this.cache.get<number>('hails.delayToComputeTaxiRatingInSec'),
      exceedAnyHailStatusTimeoutInSec: this.cache.get<number>('hails.exceedAnyHailStatusTimeoutInSec'),
      dataDumpPeriodInSec: this.cache.get<number>('hails.dataDumpPeriodInSec')
    };
  }

  /**
   * Inquiries informations
   */
  get inquiries() {
    return {
      delayToExceedPromotion: this.cache.get<number>('inquiries.delayToExceedPromotion')
    };
  }

  /**
   * Caching informations
   */
  get caching() {
    return {
      delayToExceedUsersCache: this.cache.get<number>('caching.delayToExceedUsersCache')
    };
  }

  /**
   * Taxi Registry OSRM API informations
   */
  get taxiRegistryOsrmApi() {
    return {
      base: this.cache.get<string>('taxiRegistryOsrmApi.base'),
      domainPath: this.cache.get<string>('taxiRegistryOsrmApi.domainPath'),
      route: this.cache.get<string>('taxiRegistryOsrmApi.route'),
      version: this.cache.get<string>('taxiRegistryOsrmApi.version')
    };
  }
}

export let configs: Configs = Configs.instance;

export function getAbsoluteUrl(relative: string): string {
  if (configs.environment.isDev) {
    return `https://taximtldev.accept.ville.montreal.qc.ca${relative}`;
  }

  // Default value in LOCAL
  return `http://localhost:8099${relative}`;
}
