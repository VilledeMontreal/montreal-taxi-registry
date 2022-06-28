// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
/**
 * Application constants
 */
export class Constants {
  /**
   * Application related constants
   */
  get application() {
    return {
      CONTAINER: 'container',
      CODE: 'TXP',
      DOMAIN: 'DIGITAL_SOLUTIONS'
    };
  }

  /**
   * Known environment types
   */
  get Environments() {
    return {
      LOCAL: 'localhost',
      ACC: 'acceptation',
      // ==========================================
      // "development" seems to be the standard Node label, not "dev".
      // The node-config library uses this :
      // https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
      // ==========================================
      DEV: 'development',
      // ==========================================
      // "production" seems to be the standard Node label, not "prod".
      // ==========================================
      PROD: 'production'
    };
  }

  /**
   * Environment variables
   */
  get EnvVariables() {
    return {
      /**
       * Environment type. The possible values are defined
       * in "Constants.Environments"
       * Do not change this :
       * https://github.com/lorenwest/node-config/wiki/Configuration-Files#default-node_env
       */
      NODE_ENV: 'NODE_ENV',

      NODE_APP_INSTANCE: 'NODE_APP_INSTANCE'
    };
  }

  /**
   * Endpoint type roots.
   *
   * Those roots should probably never be changed, since some
   * of our operation components (Nginx / Kong / etc.) are
   * configured for them.
   */
  get EnpointTypeRoots() {
    return {
      API: '/api'
    };
  }

  /**
   * API Errors related constants
   */
  get apiErrors() {
    return {
      codes: {}
    };
  }

  /**
   * API Errors related constants
   */
  get cacheControl() {
    return {
      NO_CACHE: `no-cache`
    };
  }

  /**
   * Custom Http headers
   */
  get defaultResponseHeaders() {
    return { 'Content-Type': 'application/json' };
  }

  /**
   * media-types constants
   */
  get mediaTypes() {
    return {
      GEOJSON: 'application/geo+json',
      JSON: 'application/json',
      PLAIN_TEXT: 'text/plain'
    };
  }

  /**
   * Localization constants
   */
  get localization() {
    return {
      locales: {
        ENGLISH: 'en',
        FRENCH_CANADIAN: 'fr-CA'
      }
    };
  }

  /**
   * OSRM constants
   */
  get osrm() {
    return {
      profile: {
        BIKE: 'bike',
        CAR: 'car',
        FOOT: 'foot'
      }
    };
  }

  /**
   * Logging constants
   */
  get logging() {
    return {
      /**
       * The properties that can be added to a log entry.
       */
      properties: {
        /**
         * The type of log. Those types are specified in
         * the following "logType" section.
         */
        LOG_TYPE: 'logType',

        /**
         * The version of the log type.
         */
        LOG_TYPE_VERSION: 'logTypeVersion',

        /**
         * "Nom du composant logiciel"
         */
        APP_NAME: 'app',

        /**
         * "Version du composant logiciel"
         */
        APP_VERSION: 'version',

        /**
         * Correlation id
         */
        CORRELATION_ID: 'cid'
      },

      /**
       * The types of logs
       */
      logType: {
        /**
         * The type for our Ville de Montréal logs.
         */
        MONTREAL: 'mtl'
      }
    };
  }

  /**
   * Libraries related constants
   */
  get libraries() {
    return {
      /**
       * The npm scope of our custom libraries.
       */
      MONTREAL_SCOPE: '@villemontreal'
    };
  }
}

export let constants: Constants = new Constants();
