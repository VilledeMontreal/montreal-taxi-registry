// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { buildApiEndpoint } from "../features/shared/utils/apiUtils";

export class controller {
  constructor(app) {
    app.get(buildApiEndpoint('/api/testTimeout'), this.testTimeout);
  }

  testTimeout(req, res, next) {
    setTimeout(() => {
      console.log('test');
    }, null);
    res.send(`Success end point is working`);
  }
}
