// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MdSnackBar } from '@angular/material';
import { userInfo } from '../data/userInfo.d';
import { AccountService } from '../services/account.service';
import { LoginService } from '../services/login.service';

const PHONE_REGEXP = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
// tslint:disable-next-line:max-line-length
const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  detailsForm: FormGroup;
  passwordForm: FormGroup;
  userinfo: userInfo;
  errorProfile: string;
  successProfile = false;
  errorPassword: string;
  successPassword = false;

  constructor(
    private fb: FormBuilder,
    public loginService: LoginService,
    public accountService: AccountService,
    public snackBar: MdSnackBar
  ) {
    this.detailsForm = this.fb.group({
      commercial_name: ['', ''],
      phone_number_technical: ['', Validators.pattern(PHONE_REGEXP)],
      email_customer: ['', Validators.pattern(EMAIL_REGEXP)],
      email_technical: ['', Validators.pattern(EMAIL_REGEXP)],
      operator_header_name: ['', ''],
      operator_api_key: ['', '']
    });
    this.passwordForm = this.fb.group(
      {
        password: ['', Validators.required],
        password_confirm: ['', Validators.required]
      },
      { validator: this.passwordMatch }
    );

    this.loginService.getUserInfo().subscribe((result) => {
      this.userinfo = result;
      this.detailsForm.patchValue({
        commercial_name: this.userinfo.commercial_name,
        phone_number_technical: this.userinfo.phone_number_technical,
        email_customer: this.userinfo.email_customer,
        email_technical: this.userinfo.email_technical,
        operator_header_name: this.userinfo.operator_header_name,
        operator_api_key: this.userinfo.operator_api_key
      });
    });
  }

  ngOnInit() {}

  ChangePassword() {
    this.successPassword = false;
    this.errorPassword = null;
    this.userinfo.password = this.passwordForm.value.password;
    this.accountService.updatePassword(this.userinfo).subscribe(
      (result) => {
        this.openSnackBar(
          'Mot de passe modifié avec succès.',
          'OK',
          'success-snackbar',
          5000
        );
        this.passwordForm.reset();
      },
      (error) => {
        this.openSnackBar(
          'Une erreur est survenue.',
          'OK',
          'error-snackbar',
          5000
        );
      }
    );
  }

  SaveProfile() {
    this.successProfile = false;
    this.errorProfile = null;
    this.userinfo.commercial_name = this.detailsForm.value.commercial_name;
    this.userinfo.phone_number_technical = this.detailsForm.value.phone_number_technical;
    this.userinfo.email_customer = this.detailsForm.value.email_customer;
    this.userinfo.email_technical = this.detailsForm.value.email_technical;
    this.userinfo.operator_header_name = this.detailsForm.value.operator_header_name;
    this.userinfo.operator_api_key = this.detailsForm.value.operator_api_key;

    this.accountService.update(this.userinfo).subscribe(
      (result) => {
        this.openSnackBar(
          'Profil modifié avec succès.',
          'OK',
          'success-snackbar',
          5000
        );
      },
      (error) => {
        this.openSnackBar(
          'Une erreur est survenue.',
          'OK',
          'error-snackbar',
          5000
        );
      }
    );
  }

  passwordMatch(c: AbstractControl) {
    let result: any;
    if (c.get('password').value === c.get('password_confirm').value) {
      result = null;
    } else {
      result = { nomatch: true };
      c.get('password_confirm').setErrors(result);
    }

    return result;
  }

  openSnackBar(
    message: string,
    action: string,
    extraClass: string,
    time: number = null
  ) {
    if (time) {
      this.snackBar.open(message, action, {
        duration: time,
        extraClasses: [extraClass]
      });
    } else {
      this.snackBar.open(message, action, { extraClasses: [extraClass] });
    }
  }
}
