// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DataSource } from '@angular/cdk';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, Sort } from '@angular/material';
import { Router } from '@angular/router';
import { AccountService } from 'app/services/account.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { Driver } from '../data/driver.d';
import { TaxiGrid } from '../data/taxi-grid.d';
import { Vehicle } from '../data/vehicle.d';
import { HailService } from '../hail/hail.service';
import { DriverService } from '../services/driver.service';
import { TaxisService } from '../services/taxis.service';
import { VehicleService } from '../services/vehicle.service';
import { displayedColumns } from './displayedColumns';
import { selectedTaxi } from './selectedTaxi';

export class TaxiDataSource extends DataSource<any> {
  constructor(
    private taxisService: TaxisService,
    private _paginator: any,
    private _sort: Sort,
    private _filter: string
  ) {
    super();
  }

  public connect(): Observable<TaxiGrid[]> {
    let filterBy: string;
    let orderBy: string;
    let orderDirection: string;

    if (this._sort && this._sort.direction) {
      orderBy = this._sort.active;
      orderDirection = this._sort.direction;
    }

    if (this._filter) {
      filterBy = this._filter;
    }

    return this.taxisService
      .page(
        this._paginator.pageIndex,
        this._paginator.pageSize,
        orderBy,
        orderDirection,
        filterBy
      )
      .map(data => {
        return data;
      });
  }

  public disconnect() {}
}

@Component({
  selector: 'app-account-manager',
  templateUrl: './taxis.component.html',
  styleUrls: ['./taxis.component.css']
})
export class TaxisComponent implements OnInit {
  isHailActif: boolean;
  count = 0;
  dataSource: TaxiDataSource;
  detail: TaxiGrid;
  displayedColumns = displayedColumns;
  operatorFilter: string;
  licenceFilter: string;
  vignetteFilter: string;
  pocketFilter: string;
  filterValue: string;
  sort: Sort;
  myPaginator: MdPaginator;
  taxiDetails: TaxiGrid;
  driverDetails: Driver;
  searching: Boolean = false;
  taxisActifs: Array<any> = [];
  vehicleDetails: Vehicle;
  urlcsv = `${environment.apiBaseUrl}/legacy-web/taxis/csv`;

  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(
    private accountService: AccountService,
    private driverService: DriverService,
    private hailService: HailService,
    private taxisService: TaxisService,
    private router: Router,
    private vehicleService: VehicleService
  ) {
    this.isHailPermitted();
  }

  private async isHailPermitted() {
    this.isHailActif = await this.hailService.isHailPermitted();
  }

  public ngOnInit() {
    if (!this.detail) {
      this.GetCount();
      this.RefreshTable();
    }
  }

  public RefreshTable() {
    this.GetCount();
    this.dataSource = new TaxiDataSource(
      this.taxisService,
      this.paginator,
      this.sort,
      this.filterValue
    );
    this.taxisService.getActif().subscribe(
      result => {
        this.taxisActifs = result;
      },
      error => {}
    );
  }

  public SortData(sort: Sort): void {
    this.sort = sort;
    this.RefreshTable();
    return;
  }

  public FilterData() {
    this.filterValue = '';
    if (this.licenceFilter) {
      this.filterValue += this.licenceFilter;
    }
    if (this.operatorFilter) {
      this.filterValue += '|' + this.operatorFilter;
    } else {
      this.filterValue += '|';
    }
    if (this.pocketFilter) {
      this.filterValue += '|' + this.pocketFilter;
    } else {
      this.filterValue += '|';
    }
    if (this.vignetteFilter) {
      this.filterValue += '|' + this.vignetteFilter;
    } else {
      this.filterValue += '|';
    }
    this.paginator.pageIndex = 0;
    this.RefreshTable();
    return;
  }

  public isTaxiActif(id: string) {
    return this.taxisActifs.includes(id);
  }

  public GetCount() {
    const parent = this;
    this.taxisService.count(this.filterValue).subscribe(result => {
      if (result) {
        parent.count = parseInt(result, null);
      }
    });
  }

  public getDetails() {
    this.searching = true;
    if (this.detail) {
      this.driverService.getDriver(this.detail.driver_id).subscribe(
        driverResult => {
          if (driverResult) {
            this.driverDetails = driverResult;
            this.vehicleService.getVehicle(this.detail.vehicle_id).subscribe(
              vehicleResult => {
                if (vehicleResult) {
                  this.vehicleDetails = vehicleResult;
                  this.searching = false;
                }
              },
              error => {
                this.searching = false;
                alert(
                  `Une erreur est survenue lors de l'obtention des détails du taxi.`
                );
              }
            );
          }
        },
        error => {
          this.searching = false;
          alert(
            `Une erreur est survenue lors de l'obtention des détails du taxi.`
          );
        }
      );
    }
  }

  public goToHailPage(row: any) {
    const params = { queryParams: selectedTaxi };
    params.queryParams.id = row.id;
    params.queryParams.licence = row.licence_plate;
    params.queryParams.operator = row.added_by_name;
    params.queryParams.vignette = row.vdm_vignette;
    this.router.navigate(['/hail'], params);
  }

  public async goToTaxiPathPage(row: any) {
    const operatorApiKey = await this.initUserApikey(row.added_by_name);
    const params = {
      queryParams: {
        taxiId: row.id,
        operatorApiKey: operatorApiKey
      }
    };
    this.router.navigate(['/path-map'], params);
  }

  public async initUserApikey(user: string) {
    const { _body } = await this.accountService.getAsyncAllAccountsPage();
    const users = JSON.parse(_body);
    const matchingUser = users.find(operator => operator.email === user);
    return matchingUser.apikey;
  }

  public Export() {
    let params = '?';
    if (this.filterValue) {
      params += 'filter=' + this.filterValue;
    }
    window.open(this.urlcsv + params);
  }

  public print() {
    let printContents, popupWin;
    printContents = document.getElementById('content').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
          <head>
              <title>Détails du taxi</title>
              <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>
              <style>
                  body {
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                    margin: 0px;
                    padding: 0px;
                    color:black !important;
                }
                .options-table{
                    margin-top:20px;
                    margin-left: 20px;
                }

                .options-table td {
                    padding: 2px 8px;
                }

                .details-table {
                    margin-top: 20px;
                }

                .details-table td {
                    padding: 2px 8px;
                }

                .details-container {
                    margin: 20px;
                    display: inline-block;
                    width: 43%;

                }
              </style>
          </head>
          <body onload='window.print();window.close()'>${printContents}
          </body>
      </html>`);
    popupWin.document.close();
  }
}
