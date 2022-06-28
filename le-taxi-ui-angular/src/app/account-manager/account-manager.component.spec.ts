// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountManagerComponent } from './account-manager.component';

describe('AccountManagerComponent', () => {
  let component: AccountManagerComponent;
  let fixture: ComponentFixture<AccountManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountManagerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
