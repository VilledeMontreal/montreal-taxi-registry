// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmdialogComponent } from './confirmdialog.component';

describe('ConfirmdialogComponent', () => {
  let component: ConfirmdialogComponent;
  let fixture: ComponentFixture<ConfirmdialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmdialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
