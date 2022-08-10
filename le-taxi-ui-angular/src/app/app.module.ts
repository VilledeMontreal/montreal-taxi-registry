// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { CdkTableModule } from '@angular/cdk';
import { NgModule } from '@angular/core';
import { HttpModule, JsonpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DateAdapter,
  MdDatepickerModule, MdDialogModule, MdNativeDateModule,
  MD_DATE_FORMATS
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModule } from './material/app.material.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { NavItemComponent } from './nav-item/nav-item.component';

import { LoginService } from './services/login.service';

import { AccountService } from './services/account.service';
import { DriverService } from './services/driver.service';
import { LibService } from './services/lib.service';
import { MapService } from './services/map.service';
import { TaxisService } from './services/taxis.service';
import { VehicleService } from './services/vehicle.service';

import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';
import { AccountManagerDetailsComponent, DialogConfirmAPIComponent, DialogConfirmPasswordComponent } from './account-manager/account-manager-details.component';
import { AccountManagerComponent } from './account-manager/account-manager.component';
import { ConfirmdialogComponent } from './confirmdialog/confirmdialog.component';
import { DriverComponent } from './driver/driver.component';
import { InfoPopupComponent } from './info-popup/info-popup.component';
import { MdpComponent } from './mdp/mdp.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { ProfileComponent } from './profile/profile.component';
import { TaxiPathMapComponent } from './taxi-path-map/taxi-path-map.component';
import { TaxiPathSidebarComponent } from './taxi-path-sidebar/taxi-path-sidebar.component';
import { TaxisComponent } from './taxis/taxis.component';
import { VehicleComponent } from './vehicle/vehicle.component';

registerLocaleData(localeFrCa, 'frCA');

import { APP_DATE_FORMAT, CustomDateAdapter } from '../config/dateFormat';
import { GtfsFeedService } from './services/gtfsFeed.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    JsonpModule,
    CdkTableModule,
    MdDatepickerModule,
    MdDialogModule,
    MdNativeDateModule
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    NavItemComponent,
    MapComponent,
    AccountManagerComponent,
    AccountManagerDetailsComponent,
    VehicleComponent,
    DriverComponent,
    MdpComponent,
    ProfileComponent,
    TaxisComponent,
    ConfirmdialogComponent,
    InfoPopupComponent,
    DialogConfirmPasswordComponent,
    DialogConfirmAPIComponent,
    NavBarComponent,
    TaxiPathMapComponent,
    TaxiPathSidebarComponent
  ],
  entryComponents: [
    ConfirmdialogComponent,
    InfoPopupComponent,
    DialogConfirmPasswordComponent,
    DialogConfirmAPIComponent
  ],
  providers: [
    LoginService,
    MapService,
    LibService,
    AccountService,
    VehicleService,
    DriverService,
    TaxisService,
    GtfsFeedService,
    MdDatepickerModule,
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MD_DATE_FORMATS, useValue: APP_DATE_FORMAT }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
