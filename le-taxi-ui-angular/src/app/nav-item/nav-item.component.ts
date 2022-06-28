// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { INavItem } from '../models/INavItem';
import { LoginService } from '../services/login.service';


declare const window: MyWindow;

@Component({
  selector: 'app-nav-item',
  templateUrl: 'nav-item.component.html',
  styleUrls: ['nav-item.component.css']
})
export class NavItemComponent {
  loginUrl = '/legacy-web/login';

  @Input() public navItems: INavItem[];
  @Input() private mainMenu: any;

  constructor(private router: Router, private loginService: LoginService) {}

  public loadPage(target: string) {
    this.loginService.getUserInfo().subscribe(
      (result) => {
        if (target.indexOf('/') !== -1) {
          target = target.replace('{host}', environment.uiBaseUrl);

          this.mainMenu.close();
          window.open(target, '_blank');
        } else {
          this.mainMenu.close();
          this.router.navigate([target]);
        }
      },
      (error) => {
        this.loginService.changeLoginStatus(false);
        this.loginService.logout();
        this.mainMenu.close();
        this.router.navigate([this.loginUrl]);
      }
    );
  }
}

interface MyWindow extends Window {
  myFunction(): void;
}
