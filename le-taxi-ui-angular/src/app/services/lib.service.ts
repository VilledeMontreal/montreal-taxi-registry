// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LibService {
  handleError(error: Response | any) {
    let message: string;

    if (error instanceof Response) {
      try {
        const body = error.json() || '';
        const err = body.error || JSON.stringify(body);
        const errMessage = err.message || err;
        const errDetails = err && err.details && err.details.map(detail => detail.message).join(',') || '';
        message = `${error.status} - ${error.statusText || ''} ${errMessage} ${errDetails}`;
      } catch (e) {
        message = `${error.status}`;
      }
    } else {
      message = error.message ? error.message : error.toString();
    }
    return Observable.throw(message);
  }

  public extractData(res: Response) {
    let body;
    try {
      body = res.json();
    } catch (e) {
      body = {};
    }
    return body;
  }
}
