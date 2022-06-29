// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { userInfo } from '../data/userInfo.d';
import { AccountService } from '../services/account.service';
import { LoginService } from '../services/login.service';

const GUID_REGEXP = /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
const PHONE_REGEXP = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
// tslint:disable-next-line:max-line-length
const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@`]+(\.[^<>()\[\]\\.,;:\s@`]+)*)|(`.+`))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// tslint:disable-next-line:max-line-length
const URL_REGEXP = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

@Component({
  templateUrl: 'dialog-confirm-apikey.html'
})
export class DialogConfirmAPIComponent {
  constructor(public dialogRef: MdDialogRef<DialogConfirmAPIComponent>) {}
}

@Component({
  templateUrl: 'dialog-confirm-password.html'
})
export class DialogConfirmPasswordComponent {
  constructor(public dialogRef: MdDialogRef<DialogConfirmPasswordComponent>) {}
}

@Component({
  selector: 'app-account-manager',
  templateUrl: './account-manager-details.component.html',
  styleUrls: ['./account-manager-details.component.css']
})
export class AccountManagerDetailsComponent implements OnInit, OnDestroy {
  user: userInfo;
  currentUser: userInfo;
  detailsForm: FormGroup;
  success: string = null;
  error: string = null;
  roles: Array<any>;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    public snackBar: MdSnackBar,
    public dialog: MdDialog
  ) {
    this.detailsForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEXP)]],
      commercial_name: ['', Validators.required],
      phone_number_technical: ['', Validators.pattern(PHONE_REGEXP)],
      email_customer: ['', Validators.pattern(EMAIL_REGEXP)],
      email_technical: ['', Validators.pattern(EMAIL_REGEXP)],
      hail_endpoint_production: ['', ''],
      operator_header_name: ['', ''],
      operator_api_key: ['', ''],
      role: ['', Validators.required],
      is_hail_enabled: [['', '']],
      public_id: ['', [Validators.pattern(GUID_REGEXP)]],
      website_url: ['', Validators.pattern(URL_REGEXP)],
      standard_booking_phone_number: ['', Validators.pattern(PHONE_REGEXP)],
      standard_booking_website_url: ['', Validators.pattern(URL_REGEXP)],
      standard_booking_android_deeplink_uri: [
        '',
        Validators.pattern(URL_REGEXP)
      ],
      standard_booking_android_store_uri: ['', Validators.pattern(URL_REGEXP)],
      standard_booking_ios_deeplink_uri: ['', Validators.pattern(URL_REGEXP)],
      standard_booking_ios_store_uri: ['', Validators.pattern(URL_REGEXP)],
      standard_booking_is_promoted_to_public: ['', ''],
      minivan_booking_is_available_from_web_url: ['', ''],
      minivan_booking_is_available_from_android_uri: ['', ''],
      minivan_booking_is_available_from_ios_uri: ['', ''],
      minivan_booking_is_promoted_to_public: ['', ''],
      special_need_booking_phone_number: ['', Validators.pattern(PHONE_REGEXP)],
      special_need_booking_website_url: ['', Validators.pattern(URL_REGEXP)],
      special_need_booking_android_deeplink_uri: [
        '',
        Validators.pattern(URL_REGEXP)
      ],
      special_need_booking_android_store_uri: [
        '',
        Validators.pattern(URL_REGEXP)
      ],
      special_need_booking_ios_deeplink_uri: [
        '',
        Validators.pattern(URL_REGEXP)
      ],
      special_need_booking_ios_store_uri: ['', Validators.pattern(URL_REGEXP)],
      special_need_booking_is_promoted_to_public: ['', '']
    });
  }

  ngOnInit() {
    this.loginService.getUserInfo().subscribe((user) => {
      this.currentUser = user;
      this.accountService.getRoles().subscribe((roles) => {
        this.roles = roles;
        if (this.currentUser.role_name !== 'admin') {
          let index = -1;
          for (let i = 0; i < this.roles.length; i++) {
            if (this.roles[i].name === 'admin') {
              index = i;
              break;
            }
          }
          if (index > -1) {
            this.roles.splice(index, 1);
          }
        }

        this.route.paramMap
          .switchMap((params: ParamMap) =>
            this.accountService.getAccount(+params.get('id'))
          )
          .subscribe(
            ([data]) => {
              this.user = data || {};
              this.detailsForm.patchValue({
                email: this.user.email,
                commercial_name: this.user.commercial_name,
                phone_number_technical: this.user.phone_number_technical,
                email_customer: this.user.email_customer,
                email_technical: this.user.email_technical,
                hail_endpoint_production: this.user.hail_endpoint_production,
                operator_header_name: this.user.operator_header_name,
                operator_api_key: this.user.operator_api_key,
                role: this.user.role,
                is_hail_enabled: this.user.is_hail_enabled,
                public_id: this.user.public_id,
                website_url: this.user.website_url,
                standard_booking_phone_number: this.user
                  .standard_booking_phone_number,
                standard_booking_website_url: this.user
                  .standard_booking_website_url,
                standard_booking_android_deeplink_uri: this.user
                  .standard_booking_android_deeplink_uri,
                standard_booking_android_store_uri: this.user
                  .standard_booking_android_store_uri,
                standard_booking_ios_deeplink_uri: this.user
                  .standard_booking_ios_deeplink_uri,
                standard_booking_ios_store_uri: this.user
                  .standard_booking_ios_store_uri,
                standard_booking_is_promoted_to_public: this.user
                  .standard_booking_is_promoted_to_public,
                minivan_booking_is_available_from_web_url: this.user
                  .minivan_booking_is_available_from_web_url,
                minivan_booking_is_available_from_android_uri: this.user
                  .minivan_booking_is_available_from_android_uri,
                minivan_booking_is_available_from_ios_uri: this.user
                  .minivan_booking_is_available_from_ios_uri,
                minivan_booking_is_promoted_to_public: this.user
                  .minivan_booking_is_promoted_to_public,
                special_need_booking_phone_number: this.user
                  .special_need_booking_phone_number,
                special_need_booking_website_url: this.user
                  .special_need_booking_website_url,
                special_need_booking_android_deeplink_uri: this.user
                  .special_need_booking_android_deeplink_uri,
                special_need_booking_android_store_uri: this.user
                  .special_need_booking_android_store_uri,
                special_need_booking_ios_deeplink_uri: this.user
                  .special_need_booking_ios_deeplink_uri,
                special_need_booking_ios_store_uri: this.user
                  .special_need_booking_ios_store_uri,
                special_need_booking_is_promoted_to_public: this.user
                  .special_need_booking_is_promoted_to_public
              });
            },
            (error) => {
              console.log(error);
            }
          );
      });
    });
  }

  ngOnDestroy() {
    if (this.snackBar) {
      this.snackBar.dismiss();
    }
  }

  ChangePassword() {
    const parent = this;
    const dialogRef = this.dialog.open(DialogConfirmPasswordComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe((option) => {
      if (option === true) {
        this.accountService.updatePassword(this.user).subscribe(
          (result) => {
            this.openSnackBar(
              `Compte utilisateur mis à jour. Envoyer le mot de passe suivant à l'utilisateur : ${result.password}`,
              `OK`,
              `success-snackbar`
            );
          },
          (error) => {
            this.openSnackBar(
              `Une erreur est survenue.`,
              `OK`,
              `error-snackbar`,
              5000
            );
          }
        );
      }
    });
  }

  ChangeAPI() {
    const dialogRef = this.dialog.open(DialogConfirmAPIComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe((option) => {
      if (option === true) {
        this.accountService.updateAPI(this.user).subscribe(
          (result) => {
            this.openSnackBar(
              `Compte utilisateur mis à jour. Envoyer la clef suivante à l'utilisateur : ${result.apikey}`,
              `OK`,
              `success-snackbar`,
              5000
            );
            this.accountService
              .getAccount(+this.user.id)
              .subscribe(([result]) => {
                this.user.apikey = result.apikey;
              });
          },
          (error) => {
            this.openSnackBar(
              `Une erreur est survenue.`,
              `OK`,
              `error-snackbar`,
              5000
            );
          }
        );
      }
    });
  }

  OpenGtfsUrlPage() {
    this.accountService.opentGtfsAcceptanceTestsPage(this.user.id);
  }

  Save(id: number) {
    this.success = null;
    this.error = null;
    this.user.email = this.detailsForm.value.email || null;
    this.user.commercial_name = this.detailsForm.value.commercial_name || null;
    this.user.phone_number_technical = this.detailsForm.value.phone_number_technical || null;
    this.user.email_customer = this.detailsForm.value.email_customer || null;
    this.user.email_technical = this.detailsForm.value.email_technical || null;
    this.user.hail_endpoint_production = this.detailsForm.value.hail_endpoint_production || null;
    this.user.operator_header_name = this.detailsForm.value.operator_header_name || null;
    this.user.operator_api_key = this.detailsForm.value.operator_api_key || null;
    this.user.role = this.detailsForm.value.role || null;
    this.user.is_hail_enabled = this.detailsForm.value.is_hail_enabled || null;
    this.user.public_id = this.detailsForm.value.public_id || null;
    this.user.website_url = this.detailsForm.value.website_url || null;
    this.user.standard_booking_phone_number = this.detailsForm.value.standard_booking_phone_number || null;
    this.user.standard_booking_website_url = this.detailsForm.value.standard_booking_website_url || null;
    this.user.standard_booking_android_deeplink_uri = this.detailsForm.value.standard_booking_android_deeplink_uri || null;
    this.user.standard_booking_android_store_uri = this.detailsForm.value.standard_booking_android_store_uri || null;
    this.user.standard_booking_ios_deeplink_uri = this.detailsForm.value.standard_booking_ios_deeplink_uri || null;
    this.user.standard_booking_ios_store_uri = this.detailsForm.value.standard_booking_ios_store_uri || null;
    this.user.standard_booking_is_promoted_to_public = this.detailsForm.value.standard_booking_is_promoted_to_public || null;
    this.user.minivan_booking_is_available_from_web_url = this.detailsForm.value.minivan_booking_is_available_from_web_url || null;
    this.user.minivan_booking_is_available_from_android_uri = this.detailsForm.value.minivan_booking_is_available_from_android_uri || null;
    this.user.minivan_booking_is_available_from_ios_uri = this.detailsForm.value.minivan_booking_is_available_from_ios_uri || null;
    this.user.minivan_booking_is_promoted_to_public = this.detailsForm.value.minivan_booking_is_promoted_to_public || null;
    this.user.special_need_booking_phone_number = this.detailsForm.value.special_need_booking_phone_number || null;
    this.user.special_need_booking_website_url = this.detailsForm.value.special_need_booking_website_url || null;
    this.user.special_need_booking_android_deeplink_uri = this.detailsForm.value.special_need_booking_android_deeplink_uri || null;
    this.user.special_need_booking_android_store_uri = this.detailsForm.value.special_need_booking_android_store_uri || null;
    this.user.special_need_booking_ios_deeplink_uri = this.detailsForm.value.special_need_booking_ios_deeplink_uri || null;
    this.user.special_need_booking_ios_store_uri = this.detailsForm.value.special_need_booking_ios_store_uri || null;
    this.user.special_need_booking_is_promoted_to_public = this.detailsForm.value.special_need_booking_is_promoted_to_public || null;

    if (this.user.id) {
      this.accountService.update(this.user).subscribe(
        (result) => {
          this.openSnackBar(
            `Compte utilisateur mis à jour.`,
            `OK`,
            `success-snackbar`,
            5000
          );
        },
        (error) => {
          this.openSnackBar(
            `Une erreur est survenue: ${error}`,
            `OK`,
            `error-snackbar`,
            5000
          );
        }
      );
    } else {
      this.accountService.insert(this.user).subscribe(
        (result) => {
          this.openSnackBar(
            `Compte utilisateur créé. Envoyer ces informations a l'utilisateur --
            Mot de passe: ${result.password} -- ApiKey: ${result.apikey}`,
            `OK`,
            `success-snackbar`
          );
          this.accountService.getAccount(+result.id).subscribe(([result]) => {
            this.user = result;
          });
        },
        (error) => {
          this.openSnackBar(
            `Une erreur est survenue.`,
            `OK`,
            `error-snackbar`,
            5000
          );
        }
      );
    }
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
