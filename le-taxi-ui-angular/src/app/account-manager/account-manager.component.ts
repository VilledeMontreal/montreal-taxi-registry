// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { DataSource } from '@angular/cdk';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdDialog, MdPaginator, Sort } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { ConfirmdialogComponent } from '../confirmdialog/confirmdialog.component';
import { userInfo } from '../data/userInfo.d';
import { AccountService } from '../services/account.service';
import { LoginService } from '../services/login.service';

export class AccountDataSource extends DataSource<any> {
  constructor(
    private accountService: AccountService,
    private _sort: Sort,
    private _paginator: any
  ) {
    super();
  }

  connect(): Observable<any[]> {
    let orderBy: string;
    let orderDirection: string;

    if (this._sort && this._sort.direction) {
      orderBy = this._sort.active;
      orderDirection = this._sort.direction;
    }
    return this.accountService
      .getAccountsPage(
        this._paginator.pageIndex,
        this._paginator.pageSize,
        orderBy,
        orderDirection
      )
      .map(data => {
        return data;
      });
  }

  disconnect() {}
}

@Component({
  selector: 'app-account-manager',
  templateUrl: './account-manager.component.html',
  styleUrls: ['./account-manager.component.css']
})
export class AccountManagerComponent implements OnInit {
  prod: boolean = environment.production;
  displayedColumns = [
    'id',
    'email',
    'role',
    'commercial_name'
  ];
  dataSource: AccountDataSource;
  count = 0;
  currentUser: userInfo;
  sort: Sort;

  @ViewChild(MdPaginator) paginator: MdPaginator;
  selectedOption: boolean;
  constructor(
    private accountService: AccountService,
    public dialog: MdDialog,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    if (this.prod) {
      this.displayedColumns = [
        'id',
        'email',
        'role',
        'commercial_name'
      ];
    }
    this.loginService.getUserInfo().subscribe(result => {
      this.currentUser = result;
    });
    this.GetCount();
    this.RefreshTable();
  }

  RefreshTable() {
    this.GetCount();
    this.dataSource = new AccountDataSource(
      this.accountService,
      this.sort,
      this.paginator
    );
  }

  SortData(sort: Sort) {
    this.sort = sort;
    this.RefreshTable();
    return;
  }

  GetCount() {
    const parent = this;
    this.accountService.getAccountsCount().subscribe(result => {
      if (result) {
        parent.count = parseInt(result, null);
      }
    });
  }

  Delete(id) {
    const parent = this;
    const dialogRef = this.dialog.open(ConfirmdialogComponent);

    dialogRef.afterClosed().subscribe(option => {
      this.selectedOption = option;
      if (this.selectedOption === true) {
        this.accountService.delete(id).subscribe(result => {
          if (result) {
            parent.RefreshTable();
          }
        });
      }
    });
  }

  CheckAccessLevel(role: string) {
    const higherRole = 'admin';
    if (this.currentUser) {
      if (role === higherRole) {
        if (this.currentUser.role_name === higherRole) {
          return true;
        } else {
          return false;
        }
      }
    }

    return true;
  }
}
