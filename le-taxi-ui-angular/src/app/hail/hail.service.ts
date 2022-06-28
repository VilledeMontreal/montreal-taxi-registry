// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { IClient } from 'app/hail/IClient';
import { Headers, Http, RequestOptions } from '@angular/http';
import { environment as env } from '../../environments/environment';
import { LoginService } from 'app/services/login.service';
import { ITaxi } from 'app/hail/ITaxi';
import 'rxjs/add/operator/catch';

const defaultHeaders = new Headers({
  'Content-Type': 'application/json',
  'x-version': 2,
  'x-api-key': ''
});

const defaultOptions = new RequestOptions({
  headers: defaultHeaders,
  withCredentials: true
});

@Injectable()
export class HailService {
  constructor(private http: Http, private loginService: LoginService) {}

  public async hailingATaxi(
    taxi: ITaxi,
    client: IClient,
    apiKey: string
  ): Promise<any> {
    const hailsUrl = `${env.apiBaseUrl}/hails`;
    const hailBody = {
      data: [
        {
          customer_lat: client.latitude,
          customer_lon: client.longitude,
          customer_address: `${client.address}`,
          taxi_id: `${taxi.id}`,
          customer_phone_number: `${client.phone}`,
          operateur: `${taxi.operator}`,
          customer_id: `anonymous`
        }
      ]
    };
    const options = new RequestOptions({ headers: defaultHeaders });
    options.headers.set('x-api-key', apiKey);

    return await this.http
      .post(hailsUrl, hailBody, options)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: any) {
    return res;
  }

  private handleError(error: any): Promise<any> {
    return error;
  }

  public async getTaxisStatus(taxiId: string, operatorApikey: string) {
    const taxisUrl = `${env.apiBaseUrl}/taxis/${taxiId}`;
    const options = defaultOptions;
    options.headers.set('x-api-key', operatorApikey);
    const response = await this.http.get(taxisUrl, options).toPromise();
    return response.json().data[0].status;
  }

  public async setHailStatusByOperator(
    hailId: string,
    payload: any,
    operatorApikey: string
  ) {
    const hailsUrl = `${env.apiBaseUrl}/hails/${hailId}`;
    const options = defaultOptions;
    options.headers.set('x-api-key', operatorApikey);
    await this.http.put(hailsUrl, payload, options).toPromise();
  }

  public async setHailStatusByClient(
    hailId: string,
    payload: any,
    apiKey: string
  ) {
    const motorHailsUrl = `${env.apiBaseUrl}/hails/${hailId}`;
    const options = defaultOptions;
    options.headers.set('x-api-key', apiKey);
    await this.http.put(motorHailsUrl, payload, options).toPromise();
  }

  public async setTaxiPositionSnapshots(
    taxi: ITaxi,
    client: IClient,
    operatorApikey: string
  ) {
    const timestamp = parseInt(`${new Date().getTime() / 1000}`, 10); // sec
    const taxiPositionSnapshots = {
      items: [
        {
          timestamp,
          operator: `${taxi.operator}`,
          taxi: `${taxi.id}`,
          lat: `${client.latitude}`,
          lon: `${client.longitude}`,
          device: 'phone',
          status: 'free',
          version: '2',
          speed: '50',
          azimuth: '180'
        }
      ]
    };
    const options = new RequestOptions({ headers: defaultHeaders });
    options.headers.set('x-api-key', operatorApikey);
    await this.http
      .post(
        `${env.apiBaseUrl}/taxi-position-snapshots`,
        taxiPositionSnapshots,
        options
      )
      .toPromise();
  }

  public async setTaxiStatusToFree(taxiId: string, operatorApikey: string) {
    const taxisUrl = `${env.apiBaseUrl}/taxis/${taxiId}`;

    const freeTaxiBody = {
      data: [
        {
          status: 'free',
          private: 'false'
        }
      ]
    };
    const options = defaultOptions;
    options.headers.set('x-api-key', operatorApikey);
    await this.http.put(taxisUrl, freeTaxiBody, options).toPromise();
  }

  public async updateHailStatus(hailId: string, operatorApikey: string) {
    const hailsUrl = `${env.apiBaseUrl}/hails/${hailId}`;
    const options = defaultOptions;
    options.headers.set('x-api-key', operatorApikey);
    const response = await this.http.get(hailsUrl, options).toPromise();
    return response.json();
  }

  public async isHailPermitted(): Promise<boolean> {
    const userInfoResponse = await this.loginService.getUserInfoAsync();
    const role = userInfoResponse.body.role_name;

    return !!(role === 'admin');
  }
}
