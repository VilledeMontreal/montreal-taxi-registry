// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoginService } from 'app/services/login.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(public loginService: LoginService, private router: Router) {}

  public async canActivate() {
    const isUserAuthenticated = await this.loginService.isAuthenticated();
    if (isUserAuthenticated) {
      this.loginService.changeLoginStatus(true);
      this.router.navigate(['taxis']);
      return false;
    }
    this.loginService.changeLoginStatus(false);
    return true;
  }
}
