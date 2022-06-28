// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUserInfo } from 'app/models/IUserInfo';
import { LoginService } from 'app/services/login.service';
import { INavItem } from 'app/models/INavItem';

@Component({
  selector: 'app-nav-bar',
  templateUrl: 'nav-bar.component.html',
  styleUrls: ['nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  private loginUrl = 'login';

  public userInfo: IUserInfo;
  public  navItems: INavItem[];

  constructor(public loginService: LoginService, private router: Router) {}

  public async ngOnInit() {}

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
