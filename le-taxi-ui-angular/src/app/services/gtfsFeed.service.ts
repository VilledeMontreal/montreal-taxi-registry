// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { LibService } from './lib.service';

@Injectable()
export class GtfsFeedService {
  private backEndUrl = environment.apiBaseUrl;
  private gtfsFeedUrl = '/taxi-registry-gtfs-feed';

  constructor(private http: Http, private libService: LibService) {}

  getGtfsUrl() {
    return this.backEndUrl + this.gtfsFeedUrl;
  }
}
