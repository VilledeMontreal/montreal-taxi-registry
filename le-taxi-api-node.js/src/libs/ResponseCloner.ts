// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export class ResponseCloner {
  constructor(response: any, res: any) {
    res.statusCode = response.statusCode;
    res.statusMessage = response.statusMessage;
    res.body = response.body;
    return res;
  }
}
