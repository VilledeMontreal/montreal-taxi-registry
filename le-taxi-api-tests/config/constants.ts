// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class Constants {
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
}

export let constants: Constants = new Constants();
