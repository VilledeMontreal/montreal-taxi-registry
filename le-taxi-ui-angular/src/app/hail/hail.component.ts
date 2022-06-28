// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IClient } from 'app/hail/IClient';
import { IHail } from 'app/hail/IHail';
import { HailService } from './hail.service';
import { ITaxi } from 'app/hail/ITaxi';
import { AccountService } from 'app/services/account.service';
import { hailEndOfPath } from './hailEndOfPath';
import { clientInfo } from 'app/hail/clientInfo';
import { IOrderHail } from 'app/hail/IOrderHail';
import { Response } from '@angular/http';
import { convertGmtToLocal, unixTimeToDate } from '../../utils/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { hailStatusDeclineByCustomer } from './hailStatusDeclineByCustomer';
import { hailOrderable } from './hailOrderable';
import { MdDialog } from '@angular/material';
import { InfoPopupComponent } from '../info-popup/info-popup.component';

const PHONE_REGEXP = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
const POSITION_REGEXP = /^([-+]?)([\d]{1,2})(((\.)(\d+)))/;

@Component({
  selector: 'app-hail',
  templateUrl: './hail.component.html',
  styleUrls: ['./hail.component.css']
})
export class HailComponent implements OnInit {
  public clientForm: FormGroup;
  public searchEngineForm: FormGroup;
  public errorMsg: string;
  public hail = {} as IHail;
  public hailId: string;
  public hailStatus: string;
  public isCancelHailEnabled = false;
  public isConfirmHailEnabled = false;
  public isOrderHailEnabled = true;
  public isRefuseHailEnabled = false;
  public positionHint = `Doit avoir 6 décimals`;
  public operatorApikey: string;
  public orderHail: IOrderHail;
  public taxi: ITaxi;

  panelOpenState = true;

  constructor(
    private accountService: AccountService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private hailService: HailService,
    private dialog: MdDialog
  ) {
    this.searchEngineForm = this.formBuilder.group({
      apiKey: ['', [Validators.required]]
    });

    this.clientForm = this.formBuilder.group({
      address: [clientInfo.address, [Validators.required]],
      id: [clientInfo.id],
      latitude: [
        clientInfo.latitude,
        [
          Validators.required,
          Validators.pattern(POSITION_REGEXP),
          Validators.minLength(8),
          Validators.maxLength(8)
        ]
      ],
      longitude: [
        clientInfo.longitude,
        [
          Validators.required,
          Validators.pattern(POSITION_REGEXP),
          Validators.minLength(8),
          Validators.maxLength(8)
        ]
      ],
      phone: [
        clientInfo.phone,
        [Validators.required, Validators.pattern(PHONE_REGEXP)]
      ]
    });
  }

  public async ngOnInit() {
    this.initTaxiDetails();
    this.orderHail = this.initOrderHail(this.clientForm.value, this.taxi);
    this.hailStatus = '';
    this.operatorApikey = await this.initUserApikey(this.taxi.operator);
  }

  public assignHail(hailPayload: any): void {
    const hail = hailPayload.data[0];

    this.taxi.phone = hail.taxi_phone_number;
    this.hailStatus = hail.status;
    this.hailId = hail.id;
    this.hail.latitude = hail.taxi.position.lat;
    this.hail.longitude = hail.taxi.position.lon;
    this.hail.dateLastStatusChange = convertGmtToLocal(hail.last_status_change);
    this.hail.dateLastTransmit = unixTimeToDate(hail.taxi.last_update);
    this.hail.incident = hail.incident_taxi_reason;
  }

  public async confirmHail(status: string) {
    await this.hailService.setHailStatusByClient(
      this.hailId,
      { data: [{ status }] },
      this.searchEngineForm.get('apiKey').value
    );
  }

  public async declinedByCustomer(status: string) {
    await this.hailService.setHailStatusByClient(
      this.hailId,
      { data: [{ status }] },
      this.searchEngineForm.get('apiKey').value
    );
  }

  public async setHailStatusByOperator(status: string) {
    await this.hailService.setHailStatusByOperator(
      this.hailId,
      { data: [{ status }] },
      this.operatorApikey
    );
  }

  public async incidentTaxi(status: string, reason: string) {
    await this.hailService.setHailStatusByOperator(
      this.hailId,
      { data: [{ status, incident_taxi_reason: reason }] },
      this.operatorApikey
    );
  }

  public initOrderHail(client: IClient, taxi: ITaxi): IOrderHail {
    return {
      customer_lat: client.latitude,
      customer_lon: client.longitude,
      customer_address: client.address,
      taxi_id: taxi.id,
      customer_phone_number: client.phone,
      operateur: taxi.operator,
      customer_id: `anonymous`
    };
  }

  public initTaxiDetails(): void {
    const taxi = {} as ITaxi;
    this.route.queryParams.subscribe(params => Object.assign(taxi, params));
    this.taxi = taxi;
  }

  public async orderAHail(): Promise<void> {
    const hailPayload = await this.hailService.hailingATaxi(
      this.taxi,
      this.clientForm.value,
      this.searchEngineForm.get('apiKey').value
    );
    await this.handleCustomError(hailPayload);
  }

  public async handleCustomError(hailPayload: Response): Promise<void> {
    if (hailPayload.status === 401) {
      this.dialog.open(InfoPopupComponent, {
        data: {
          title: 'Clé d\'API invalide',
          line1:
            'La clé d\'API, de la section Information du moteur de recherche, est invalide.',
          line2:
            'Veuillez saisir une clé d\'API du moteur de recherche valide et réessayer.',
          line3: ''
        }
      });

      return;
    }
    const hail = hailPayload.json();
    if (hailPayload.ok) {
      this.assignHail(hail);
      this.errorMsg = ``;
    } else {
      this.errorMsg = hail.message;
    }
  }

  public async initUserApikey(user: string) {
    const { _body } = await this.accountService.getAsyncAllAccountsPage();
    const users = JSON.parse(_body);
    const matchingUser = users.find(operator => operator.email === user);
    return matchingUser.apikey;
  }

  public refreshDisplay() {
    if (hailEndOfPath.includes(this.hailStatus)) {
      this.resetTaxi();
    }
    this.isOrderHailEnabled = hailOrderable.includes(this.hailStatus);
    this.isConfirmHailEnabled = this.hailStatus === 'accepted_by_taxi';
    this.isCancelHailEnabled = this.hailStatus === 'accepted_by_customer';
    this.isRefuseHailEnabled = hailStatusDeclineByCustomer.includes(
      this.hailStatus
    );
  }

  public async resfreshStatus() {
    if (this.hailId) {
      const hailPayload = await this.hailService.updateHailStatus(
        this.hailId,
        this.operatorApikey
      );
      this.taxi.status = await this.hailService.getTaxisStatus(
        this.taxi.id,
        this.operatorApikey
      );
      this.assignHail(hailPayload);
      this.refreshDisplay();
    }
  }

  public async resetTaxi() {
    await this.hailService.setTaxiStatusToFree(
      this.taxi.id,
      this.operatorApikey
    );
    await this.hailService.setTaxiPositionSnapshots(
      this.taxi,
      this.clientForm.value,
      this.operatorApikey
    );
  }
}
