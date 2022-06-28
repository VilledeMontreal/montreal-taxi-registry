// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DataSource } from '@angular/cdk';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdPaginator, Sort } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { Driver } from '../data/driver.d';
import { createMapSearchTerms } from '../map/mapSearchTerms';
import { DriverService } from '../services/driver.service';

export class DriverDataSource extends DataSource<any> {
  constructor(
    private driverService: DriverService,
    private _paginator: any,
    private _sort: Sort,
    private _filter: string
  ) {
    super();
  }

  connect(): Observable<Driver[]> {
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

    return this.driverService
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
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.css']
})
export class DriverComponent implements OnInit {
  displayedColumns = [
    'professional_licence',
    'first_name',
    'last_name',
    'last_update_at',
    'added_by_name',
    'location'
  ];
  dataSource: DriverDataSource;
  count = 0;
  sort: Sort;

  firstNameFilter: string;
  lastNameFilter: string;
  licenceFilter: string;
  operatorFilter: string;

  filterValue: string;
  myPaginator: MdPaginator;

  urlcsv = `${environment.apiBaseUrl}/legacy-web/drivers/csv`;

  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(private driverService: DriverService, private router: Router) {}

  ngOnInit() {
    this.GetCount();
    this.RefreshTable();
  }

  RefreshTable() {
    this.GetCount();
    this.dataSource = new DriverDataSource(
      this.driverService,
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

    this.filterValue += '|';
    if (this.lastNameFilter) {
      this.filterValue += this.lastNameFilter;
    }

    this.filterValue += '|';
    if (this.firstNameFilter) {
      this.filterValue += this.firstNameFilter;
    }

    this.filterValue += '|';
    if (this.operatorFilter) {
      this.filterValue += this.operatorFilter;
    }

    this.paginator.pageIndex = 0;
    this.RefreshTable();
    return;
  }

  GetCount() {
    const parent = this;
    this.driverService.count(this.filterValue).subscribe(result => {
      if (result) {
        parent.count = parseInt(result, null);
      }
    });
  }

  Export() {
    const parent = this;
    let params = '?';
    if (this.filterValue) {
      params += 'filter=' + this.filterValue;
    }
    window.open(this.urlcsv + params);
  }

  public goToMapPage(row: any) {
    const params = { queryParams: createMapSearchTerms() };
    params.queryParams.professionalLicence = row.professional_licence;
    this.router.navigate(['/map'], params);
  }
}
