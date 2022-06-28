// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, Inject, OnInit } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.css']
})
export class InfoPopupComponent implements OnInit {
  constructor(@Inject(MD_DIALOG_DATA) public data: any) {}

  ngOnInit() {}
}
