// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { INavItem } from 'app/models/INavItem';
import { IUserInfo } from 'app/models/IUserInfo';
import { GtfsFeedService } from 'app/services/gtfsFeed.service';
import { LoginService } from 'app/services/login.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: 'nav-bar.component.html',
  styleUrls: ['nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  private loginUrl = 'login';

  public userInfo: IUserInfo;
  public  navItems: INavItem[];

  constructor(public loginService: LoginService, public gtfsFeedService: GtfsFeedService, private router: Router) {}

  public async ngOnInit() {}

  public async downloadGtfsFeed() {
    var link = document.createElement("a");
    link.download = 'gtfs_feed.zip';
    link.href = this.gtfsFeedService.getGtfsUrl();
    link.click();
  }

  public logout() {
    this.loginService.logout().subscribe(() => {
      this.userInfo = undefined;
      this.navItems = undefined;
      this.loadPage(this.loginUrl);
    });
  }

  public async loadMenu() {
    try {
      if (!this.userInfo) {
        this.loadUserInfo();
      }

      if (!this.navItems) {
        this.navItems = await this.loginService.getMenuAsync();
      }

    } catch (err) {
      console.error(err);
      this.logout();
    }
  }

  private async loadUserInfo() {
    const userInfoResponse = await this.loginService.getUserInfoAsync();
    if (!userInfoResponse.body) {
      return this.logout();
    }
    this.userInfo = userInfoResponse.body;
  }

  public loadPage(target: string) {
    this.router.navigate([target]);
  }
}
