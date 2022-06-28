// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import * as superagent from 'superagent';
import { environment } from '../../environments/environment';
import { LibService } from './lib.service';



const headers = new Headers({
  'Content-Type': 'application/json'
});
const options = new RequestOptions({
  headers,
  withCredentials: true
});

@Injectable()
export class LoginService {
  public userLoggedIn = false;
  private backEndUrl = environment.apiBaseUrl;
  private loginUrl = '/legacy-web/login/DoLogin';
  private logOutUrl = '/legacy-web/login/logout';
  private usernameUrl = '/legacy-web/login/userinfo';
  private login: any = {};

  constructor(private http: Http, private libService: LibService) {}

  public changeLoginStatus(status: boolean) {
    this.userLoggedIn = status;
  }

  public async isAuthenticated() {
    const currentUserInfo = await this.getUserInfoAsync();
    return currentUserInfo.ok && !!currentUserInfo.body;
  }

  public getUserInfo(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.usernameUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  async getMenuAsync(): Promise<any> {
    const menu = await this.http.get(`${this.backEndUrl}/legacy-web/menu`, options).toPromise();
    return menu.json();
  }

  async getUserInfoAsync(): Promise<any> {
    return await superagent
      .get(`${this.backEndUrl}${this.usernameUrl}`)
      .ok((res) => !!res.status)
      .withCredentials()
      .set('Content-Type', 'application/json');
  }

  logout(): Observable<any> {
    return this.http
      .get(this.backEndUrl + this.logOutUrl, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }

  verifyLogin(user: string, pass: string): Observable<any> {
    this.login.login = user;
    this.login.password = pass;

    return this.http
      .post(this.backEndUrl + this.loginUrl, this.login, options)
      .map(this.libService.extractData)
      .catch(this.libService.handleError);
  }
}
