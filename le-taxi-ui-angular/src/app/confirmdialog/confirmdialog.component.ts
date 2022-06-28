// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirmdialog',
  templateUrl: './confirmdialog.component.html',
  styleUrls: ['./confirmdialog.component.css']
})
export class ConfirmdialogComponent implements OnInit {
  constructor(public dialogRef: MdDialogRef<ConfirmdialogComponent>) {}
  ngOnInit() {}
}
