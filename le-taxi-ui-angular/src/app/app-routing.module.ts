// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HailComponent } from './hail/hail.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { TaxiPathMapComponent } from './taxi-path-map/taxi-path-map.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { AccountManagerDetailsComponent } from './account-manager/account-manager-details.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { DriverComponent } from './driver/driver.component';
import { MdpComponent } from './mdp/mdp.component';
import { ProfileComponent } from './profile/profile.component';
import { TaxisComponent } from './taxis/taxis.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { LoginGuard } from './guards/login.guard';
import { RolesGuard } from './guards/roles.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'taxis',
    pathMatch: 'full'
  },
  {
    path: '',
    canActivateChild: [AuthenticationGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'map',
        component: MapComponent
      },
      {
        path: 'hail',
        component: HailComponent,
        canActivate: [RolesGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'account',
        component: AccountManagerComponent
      },
      {
        path: 'account/details',
        component: AccountManagerDetailsComponent
      },
      {
        path: 'account/details/:id',
        component: AccountManagerDetailsComponent
      },
      {
        path: 'vehicles',
        component: VehicleComponent
      },
      {
        path: 'drivers',
        component: DriverComponent
      },
      {
        path: 'mdp',
        component: MdpComponent
      },
      {
        path: 'taxis',
        component: TaxisComponent
      },
      {
        path: 'path-map',
        component: TaxiPathMapComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthenticationGuard, LoginGuard, RolesGuard]
})
export class AppRoutingModule {}
