// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { LoginService } from 'app/services/login.service';
import { MdDialog } from '@angular/material';
import { InfoPopupComponent } from '../info-popup/info-popup.component';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    public loginService: LoginService,
    private router: Router,
    private dialog: MdDialog
  ) {}

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const userInfoResponse = await this.loginService.getUserInfoAsync();
    if (!userInfoResponse.body) {
      this.router.navigate(['login']);

      return false;
    }
    const currentUser = userInfoResponse.body;
    if (!currentUser.role_name) {
      this.router.navigate(['login']);

      return false;
    }
    const roles = route.data.roles;
    if (roles && roles.includes(currentUser.role_name)) {
      return true;
    }
    this.dialog.open(InfoPopupComponent, {
      data: {
        title: 'Accès interdit',
        line1:
          'Vos droit d\'utilisateur ne vous permettent pas l\'accès à la page demandée',
        line2: `Vous êtes redirigé vers la page d'accueil taxis`,
        line3: ''
      }
    });
    this.router.navigate(['taxis']);

    return false;
  }
}
