// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { LibService } from '../services/lib.service';


@Injectable()
export class VehicleService {
  private backEndUrl = environment.apiBaseUrl;
  private countUrl = '/legacy-web/vehicles/count';
  private getUrl = '/legacy-web/vehicles';

  constructor(private http: Http, private libService: LibService) {}

  count(filter: string): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    let params = '?';
    if (filter) {
      params += '&filter=' + filter;
    }

    return this.http
      .get(this.backEndUrl + this.countUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  page(
    pageIndex: number,
    pageSize: number,
    orderby: string,
    orderDirection: string,
    filter: string
  ): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });
    let params: string = '?page=' + pageIndex + '&pagesize=' + pageSize;
    if (orderby) {
      params += '&order=' + orderby + ' ' + orderDirection;
    }

    if (filter) {
      params += '&filter=' + filter;
    }

    return this.http
      .get(this.backEndUrl + this.getUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getVehicle(id: string): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .get(this.backEndUrl + this.getUrl + '?id=' + id, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }
}
