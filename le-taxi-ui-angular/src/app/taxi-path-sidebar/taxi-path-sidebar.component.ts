// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaxisService } from '../services/taxis.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDateTimeRange } from './IDateTimeRange';
import { ITaxiPath } from 'app/services/ITaxiPath';
import { ITaxiSnapshot } from 'app/taxi-path-map/ITaxiSnapshot';
@Component({
  selector: 'app-taxi-path-sidebar',
  templateUrl: './taxi-path-sidebar.component.html',
  styleUrls: ['./taxi-path-sidebar.component.css']
})
export class TaxiPathSidebarComponent implements OnInit {
  hours = Array.from(Array(24).keys());
  minutes = Array.from(Array(60).keys());
  pathError = '';
  pathForm: FormGroup;

  @Input() taxiId: string;
  @Input() taxiSnapshot: ITaxiSnapshot;
  @Output() selectedPath = new EventEmitter();
  @Output() taxiSnapshotDirection = new EventEmitter();

  constructor(
    private taxisService: TaxisService,
    private formBuilder: FormBuilder
  ) {
    this.initPathForm();
  }

  public async ngOnInit() {
    this.initTaxiSnapshot();
  }

  public changeTaxiSnapshot(step: number): void {
    this.taxiSnapshotDirection.emit(step);
  }

  public downloadFile(
    JSONBody: any,
    taxiId: string,
    fromDate: Date,
    toDate: Date
  ): void {
    const blob = new Blob([JSONBody], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadElement = document.createElement('a');
    downloadElement.href = url;
    downloadElement.download = `${taxiId}_${fromDate.getTime() /
      1000}-${toDate.getTime() / 1000}.json`;
    document.body.appendChild(downloadElement);
    downloadElement.click();
  }

  public async exportSelectedPath(): Promise<void> {
    this.pathError = '';
    const fromDate = this.getFormDateUtc(this.pathForm, 'from');
    const toDate = this.getFormDateUtc(this.pathForm, 'to');

    if (this.isTaxiPathFormValid(fromDate, toDate)) {
      const { body, status } = await this.taxisService.getTaxiPath(
        this.taxiId,
        fromDate.toISOString(),
        toDate.toISOString()
      );

      if (this.isGeojsonPathValid(status, body)) {
        this.downloadFile(JSON.stringify(body), this.taxiId, fromDate, toDate);
      }
    }
  }

  public isTaxiPathFormValid(fromDate: Date, toDate: Date): boolean {
    if (toDate > fromDate) {
      return true;
    }
    this.pathError = 'Erreur: Date début doit être avant la date de fin';

    return false;
  }

  public getFormDateUtc(pathForm: any, marker: string) {
    const date = this.appDateToDate(pathForm.get(`${marker}Date`).value);
    date.setHours(Number(pathForm.get(`${marker}Hour`).value));
    date.setMinutes(Number(pathForm.get(`${marker}Minute`).value));

    return date;
  }

  private appDateToDate(dateIn: string | Date): Date {
    // format dd-mm-yyyy
    let dateText: string;
    if (typeof dateIn !== 'string') {
      dateText = `${dateIn.getDate()}-${dateIn.getMonth() +
        1}-${dateIn.getFullYear()}`;
    } else {
      dateText = dateIn;
    }
    const aDateText = dateText.split('-');
    return new Date(
      parseInt(aDateText[2], 10),
      parseInt(aDateText[1], 10) - 1,
      parseInt(aDateText[0], 10)
    );
  }

  public async initDateRange(): Promise<IDateTimeRange> {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const toHour = now.getHours();
    const hourFrom = toHour - 8;
    const minute = now.getMinutes();
    const dateTimeRange = {
      date: `${day}-${month}-${year}`,
      hourFrom,
      minute,
      toHour
    };
    return dateTimeRange;
  }

  public async initPathForm(): Promise<void> {
    const range = await this.initDateRange();
    this.pathForm = this.formBuilder.group({
      fromDate: [`${range.date}`, Validators.required],
      fromHour: [`${range.hourFrom}`, Validators.required],
      fromMinute: [`${range.minute}`, Validators.required],
      toDate: [`${range.date}`, Validators.required],
      toHour: [`${range.toHour}`, Validators.required],
      toMinute: [`${range.minute}`, Validators.required]
    });
  }

  public initTaxiSnapshot(): void {
    this.taxiSnapshot = {
      latitude: 0,
      longitude: 0,
      status: 'n.a.',
      timestampUTC: null,
      azimuth: 0,
      speed: 0
    } as ITaxiSnapshot;
  }

  public isGeojsonPathValid(status: number, body: ITaxiPath): boolean {
    let result = true;

    switch (true) {
      case status === 404:
        this.pathError = `Erreur: Taxi ${this.taxiId} non trouvé`;
        result = false;
        break;
      case status === 400:
        this.pathError = `Erreur: Différence entre les dates doivent être plus petite que 8 heures`;
        result = false;
        break;
      case status !== 200:
        this.pathError = `Erreur: la requête n'a pas plus être complétée.`;
        result = false;
        break;
      case status === 200 && body.features.length <= 1:
        result = false;
        this.pathError = `Erreur: le trajet ne contient pas de données.`;
        break;
    }

    return result;
  }

  public async visualizeSelectedPath(): Promise<void> {
    this.pathError = '';
    const fromDate = this.getFormDateUtc(this.pathForm, 'from');
    const toDate = this.getFormDateUtc(this.pathForm, 'to');

    if (this.isTaxiPathFormValid(fromDate, toDate)) {
      const { body, status } = await this.taxisService.getTaxiPath(
        this.taxiId,
        fromDate.toISOString(),
        toDate.toISOString()
      );

      if (this.isGeojsonPathValid(status, body)) {
        this.selectedPath.emit(JSON.stringify(body));
      }
    }
  }
}
