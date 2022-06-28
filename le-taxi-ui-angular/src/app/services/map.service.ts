// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { DetailsTaxi } from '../data/detailsTaxi.d';
import { LibService } from '../services/lib.service';


const headers = new Headers({
  'Content-Type': 'application/json'
});
const options = new RequestOptions({
  headers,
  withCredentials: true
});

@Injectable()
export class MapService {
  private backEndUrl = environment.apiBaseUrl;
  private PositionsUrl = '/legacy-web/taxi-positions';
  private TaxiDetailsUrl = '/legacy-web/taxi-data/';
  private TaxiOperatorsUrl = '/legacy-web/taxi-operators/';
  private TaxiSearchUrl = '/legacy-web/taxi-search';
  private TaxiAreasUrl = `/legacy-web/taxi-areas`;

  constructor(private http: Http, private libService: LibService) {}

  getPositions(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.PositionsUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getTaxiAreas(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.TaxiAreasUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getTaxiDetails(idTaxi: string): Observable<DetailsTaxi> {
    return this.http
      .get(this.backEndUrl + this.TaxiDetailsUrl + '?idTaxi=' + idTaxi, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getOperators(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.TaxiOperatorsUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  searchByLicencePlate(term: string): Observable<any> {
    return this.http
      .get(
        this.backEndUrl + this.TaxiSearchUrl + '?licencePlate=' + term,
        options
      )
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  searchByProfessionalLicence(term: string): Observable<any> {
    return this.http
      .get(
        this.backEndUrl + this.TaxiSearchUrl + '?professionalLicence=' + term,
        options
      )
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getOperatorsPage(pageIndex: number, pageSize: number): Observable<any> {
    const params: string =
      '?from=' +
      pageIndex * pageSize +
      '&to=' +
      pageIndex * pageSize +
      pageIndex;

    return this.http
      .get(this.backEndUrl + this.TaxiOperatorsUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }
}
