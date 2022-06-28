// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import * as superagent from 'superagent';
import { environment as env } from '../../environments/environment';
import { LibService } from '../services/lib.service';
import { ITaxiDetails } from './ITaxiDetails';



const headers = new Headers({
  'Content-Type': 'application/json'
});
const options = new RequestOptions({
  headers,
  withCredentials: true
});

@Injectable()
export class TaxisService {
  private backEndUrl = env.apiBaseUrl;
  private pageUrl = '/legacy-web/taxis/grid';
  private countUrl = '/legacy-web/taxis/count';
  private actifUrl = '/legacy-web/taxis/actif';

  constructor(private http: Http, private libService: LibService) {}

  public count(filter: string): Observable<any> {
    let params = '?';
    if (filter) {
      params += '&filter=' + filter;
    }

    return this.http
      .get(this.backEndUrl + this.countUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  public page(
    pageIndex: number,
    pageSize: number,
    orderby: string,
    orderDirection: string,
    filter: string
  ): Observable<any> {
    let params = '?page=' + pageIndex + '&pagesize=' + pageSize;
    if (orderby) {
      params += '&order=' + orderby + ' ' + orderDirection;
    }

    if (filter) {
      params += '&filter=' + filter;
    }

    return this.http
      .get(this.backEndUrl + this.pageUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  public getActif(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.actifUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  public async getTaxiDetailsAsync(
    taxiId: string,
    operatorApiKey: string
  ): Promise<ITaxiDetails> {
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      'x-version': 2,
      'x-api-key': operatorApiKey
    });
    const requestOptions = new RequestOptions({
      headers: requestHeaders,
      withCredentials: true
    });
    const taxiDetails = await this.http
      .get(`${this.backEndUrl}/legacy-web/taxi-data/?idTaxi=${taxiId}`, requestOptions)
      .toPromise();

    return taxiDetails.json()[0];
  }

  public async getTaxiPath(
    taxiId: string,
    fromDate: string,
    toDate: string
  ): Promise<any> {
    try {
      const res = await superagent
        .get(`${this.backEndUrl}/legacy-web/taxi-path/${taxiId}`)
        .withCredentials()
        .set('Content-Type', 'application/json')
        .query({ fromDate, toDate });

      return res;
    } catch (err) {
      return { body: '', status: err.response.status };
    }
  }
}
