// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  homeUrl = '/taxis';
  connectionError: string;
  connecting = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

  doConnect() {
    this.connecting = true;
    this.connectionError = '';
    const formModel = this.loginForm.value;

    this.loginService.verifyLogin(formModel.user, formModel.password).subscribe(
      result => {
        if (result) {
          this.loginService.changeLoginStatus(true);
          this.router.navigate([this.homeUrl]);
        }
        this.connecting = false;
      },
      error => {
        this.connectionError = `Nom d'utilisateur ou mot de passe incorrect.`;
        this.loginService.changeLoginStatus(false);
        this.connecting = false;
      }
    );
  }
}
