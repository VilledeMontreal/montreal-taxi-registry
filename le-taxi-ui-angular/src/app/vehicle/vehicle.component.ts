// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DataSource } from '@angular/cdk';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, Sort } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { Vehicle } from '../data/vehicle.d';
import { createMapSearchTerms } from '../map/mapSearchTerms';
import { VehicleService } from '../services/vehicle.service';

export class VehicleDataSource extends DataSource<any> {
  constructor(
    private vehicleService: VehicleService,
    private _paginator: any,
    private _sort: Sort,
    private _filter: string
  ) {
    super();
  }

  connect(): Observable<Vehicle[]> {
    // let testfilter:string = this._filter.nativeElement.;
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

    return this.vehicleService
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

  disconnect() {}
}

@Component({
  selector: 'app-account-manager',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.css']
})
export class VehicleComponent implements OnInit {
  displayedColumns = ['licence_plate', 'added_by_name', 'location'];
  dataSource: VehicleDataSource;
  count = 0;
  sort: Sort;
  operatorFilter: string;
  licenceFilter: string;
  filterValue: string;
  detail: Vehicle;
  myPaginator: MdPaginator;
  vehicleDetails: Vehicle;

  urlcsv = `${environment.apiBaseUrl}/legacy-web/vehicles/csv`;

  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(private vehicleService: VehicleService, private router: Router) {}

  ngOnInit() {
    if (!this.detail) {
      this.GetCount();
      this.RefreshTable();
    }
  }

  RefreshTable() {
    this.GetCount();
    this.dataSource = new VehicleDataSource(
      this.vehicleService,
      this.paginator,
      this.sort,
      this.filterValue
    );
  }

  SortData(sort: Sort) {
    this.sort = sort;
    this.RefreshTable();
    return;
  }

  FilterData() {
    this.filterValue = '';
    if (this.licenceFilter) {
      this.filterValue += this.licenceFilter;
    }
    if (this.operatorFilter) {
      this.filterValue += '|' + this.operatorFilter;
    }
    this.paginator.pageIndex = 0;
    this.RefreshTable();
    return;
  }

  GetCount() {
    const parent = this;
    this.vehicleService.count(this.filterValue).subscribe(result => {
      if (result) {
        parent.count = parseInt(result, null);
      }
    });
  }

  getDetails(detail: any) {
    const keys = Object.keys(detail);
    const arrValues: Array<any> = new Array();
    keys.forEach(element => {
      arrValues.push({
        key: element,
        value: detail[element]
      });
    });
    return arrValues;
  }

  Export() {
    const parent = this;
    let params = '?';
    if (this.filterValue) {
      params += 'filter=' + this.filterValue;
    }
    window.open(this.urlcsv + params);
  }

  print() {
    let printContents, popupWin;
    printContents = document.getElementById('content').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
          <head>
              <title>Détails du vehicule</title>
              <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
              <style>
                  body {
                    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                    margin: 0px;
                    padding: 0px;
                    color:black !important;
                }
              </style>
          </head>
          <body onload="window.print();window.close()">${printContents}
          </body>
      </html>`);
    popupWin.document.close();
  }

  public goToMapPage(row: any) {
    const params = { queryParams: createMapSearchTerms() };
    params.queryParams.licencePlate = row.licence_plate;
    this.router.navigate(['/map'], params);
  }
}
