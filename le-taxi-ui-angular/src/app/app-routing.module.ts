// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountManagerDetailsComponent } from './account-manager/account-manager-details.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { DriverComponent } from './driver/driver.component';
import { AuthenticationGuard } from './guards/authentication.guard';
import { LoginGuard } from './guards/login.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { MdpComponent } from './mdp/mdp.component';
import { ProfileComponent } from './profile/profile.component';
import { TaxiPathMapComponent } from './taxi-path-map/taxi-path-map.component';
import { TaxisComponent } from './taxis/taxis.component';
import { VehicleComponent } from './vehicle/vehicle.component';

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
