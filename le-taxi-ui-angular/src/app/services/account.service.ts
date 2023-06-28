// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { userInfo } from '../data/userInfo.d';
import { LibService } from '../services/lib.service';

@Injectable()
export class AccountService {
  private backEndUrl = environment.apiBaseUrl;
  private getAccountsUrl = '/legacy-web/users';
  private getAccountsCountUrl = '/legacy-web/users/count';
  private deleteUrl = '/legacy-web/users';
  private updateUrl = '/legacy-web/users';
  private insertUrl = '/legacy-web/users';
  private updatePasswordUrl = '/legacy-web/users/password';
  private roleUrl = '/legacy-web/roles';
  private gtfsAcceptanceTestsUrl = '/users/:id/gtfs-url-scheme-acceptance-test';

  constructor(private http: Http, private libService: LibService) {}

  getAccountsCount(): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .get(this.backEndUrl + this.getAccountsCountUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getAccountsPage(
    pageIndex: number,
    pageSize: number,
    orderby: string,
    orderDirection: string
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

    return this.http
      .get(this.backEndUrl + this.getAccountsUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getAccount(id: number): Observable<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });
    const params: string = '?id=' + id.toString();
    return this.http
      .get(this.backEndUrl + this.getAccountsUrl + params, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  public async getAsyncAllAccountsPage(): Promise<any> {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers,
      withCredentials: true
    });

    const params = `?page=0&pagesize=1000000`;
    return await this.http
      .get(this.backEndUrl + this.getAccountsUrl + params, options)
      .toPromise();
  }

  insert(userinfo: userInfo) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .post(this.backEndUrl + this.insertUrl, userinfo, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  update(userinfo: userInfo) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .put(this.backEndUrl + this.updateUrl, userinfo, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  delete(id: String) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .delete(this.backEndUrl + this.deleteUrl + '?id=' + id, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  updatePassword(userinfo: userInfo) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .put(this.backEndUrl + this.updatePasswordUrl, userinfo, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  getRoles() {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    return this.http
      .get(this.backEndUrl + this.roleUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  opentGtfsAcceptanceTestsPage(userId: string) {
    const url = this.backEndUrl + this.gtfsAcceptanceTestsUrl.replace(':id', userId);
    window.open(url, "_blank");
  }
}
