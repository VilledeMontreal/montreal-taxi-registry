// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Router, CanActivateChild } from '@angular/router';
import { LoginService } from 'app/services/login.service';

@Injectable()
export class AuthenticationGuard implements CanActivateChild {
  loginUrl = 'login';

  constructor(public loginService: LoginService, private router: Router) {}

  public async canActivateChild() {
    const isUserAuthenticated = await this.loginService.isAuthenticated();
    if (!isUserAuthenticated) {
      this.loginService.changeLoginStatus(false);
      this.router.navigate(['login']);
      return false;
    }
    this.loginService.changeLoginStatus(true);
    return true;
  }
}
