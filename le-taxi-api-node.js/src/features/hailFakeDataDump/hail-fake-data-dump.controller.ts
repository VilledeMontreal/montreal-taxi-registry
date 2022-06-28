// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { BadRequestError } from '../errorHandling/errors';
import { allow } from '../users/securityDecorator';
import {
  combinationFieldsName,
  combinationList,
  generatedFileName,
  operatorName,
  statusSuite,
  taxiIncidentReason,
  taxisId,
  toReturnFileName
} from './hail-fake-data-dump.constants';
import { IStatusHistory } from './hail-fake-data-dump.model';

import { StatusCodes } from 'http-status-codes';

const fs = require('fs');

class HailFakeDataDumpController {
  public jsonObject = {
    items: []
  };

  public jsonItems: any[];

  public resultats = {};

  constructor() {
    this.jsonItems = [];
    this.jsonObject.items = [];

    combinationFieldsName.forEach((item, index) => {
      this.resultats[item] = '';
    });
  }

  // Génére un fichier des données virtuelles
  @allow(['admin', 'gestion', 'stats'])
  public buildFakeData(req, res, next) {
    let dateIn: Date;
    try {
      dateIn = new Date(req.params.timeSlot);
    } catch {
      next(new BadRequestError('Wrong date format.'));
    }

    hailFakeDataDumpController.getCombinations(0);
    hailFakeDataDumpController.jsonObject.items = hailFakeDataDumpController.jsonItems;

    hailFakeDataDumpController.groupHails();
    hailFakeDataDumpController.assignRatingRideReason();
    hailFakeDataDumpController.assignTaxisId();
    hailFakeDataDumpController.assignTaxiReason();
    // hailFakeDataDumpController.assignOperatorName();
    hailFakeDataDumpController.removeOperator();
    hailFakeDataDumpController.assignStatusHistory();

    try {
      fs.unlinkSync(generatedFileName);
    } catch {
      // tslint:disable-next-line: no-console
      console.log('Erreur. Effacer fichier');
    }

    try {
      fs.writeFileSync(generatedFileName, JSON.stringify(hailFakeDataDumpController.jsonObject, null, 2));
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.log('Erreur. Écrire fichier');
    }

    const ret = {
      note: '',
      items: []
    };
    const rawdata = fs.readFileSync(generatedFileName);
    const data = JSON.parse(rawdata);
    for (let i = 0; i < 801; i++) {
      ret.items.push(data.items[i]);
    }
    // debut GABB results subset
    try {
      fs.unlinkSync(generatedFileName);
    } catch {
      // tslint:disable-next-line: no-console
      console.log('Erreur. Effacer fichier');
    }

    try {
      fs.writeFileSync(generatedFileName, JSON.stringify(ret, null, 2));
    } catch (err) {
      // tslint:disable-next-line: no-console
      console.log('Erreur. Écrire fichier');
    }
    // fin GABB

    ret.note = `${data.items.length} hèles crées. Suit resultat partiel`;

    res.status(StatusCodes.OK).send(ret);
  }

  // Retoure les données virtuelles
  @allow(['admin', 'gestion', 'stats'])
  public dumpFakeData(req, res, next) {
    let dateStart: Date;
    const dateEnd = new Date();

    dateStart = hailFakeDataDumpController.getDateFromString(req.params.timeSlot);
    if (!dateStart) {
      res.status(StatusCodes.BAD_REQUEST).send('Wrong date format.');

      return;
    }

    if (!hailFakeDataDumpController.isDateInPermittedRange(dateStart)) {
      res.status(StatusCodes.BAD_REQUEST).send('Date out of range.');

      return;
    }

    if (dateStart.getMinutes() % 10 !== 0) {
      res.status(StatusCodes.BAD_REQUEST).send('Date value is invalid.');

      return;
    }

    const delayMilliSecs = 10 * 60 * 1000;
    dateEnd.setTime(dateStart.getTime() + delayMilliSecs);

    const rawdata = fs.readFileSync(toReturnFileName);
    const data = JSON.parse(rawdata);

    const jsonItems = [];
    data.items.forEach(item => {
      const lastStatusDate = new Date(item.status_history[item.status_history.length - 1].timestampUTC);
      if (lastStatusDate >= dateStart && lastStatusDate < dateEnd) {
        jsonItems.push(item);
      }
    });

    hailFakeDataDumpController.jsonObject.items = jsonItems;
    res.status(StatusCodes.OK).send(hailFakeDataDumpController.jsonObject);
  }

  // Retoure un resumé des données virtuelles
  @allow(['admin', 'gestion', 'stats'])
  public resumeFakeData(req, res, next) {
    const format = req.params.format ? req.params.format : 'json';
    const rawdata = fs.readFileSync(toReturnFileName);
    const data = JSON.parse(rawdata);

    const resume = [];

    if (format === 'csv') {
      resume.push(`taxi_id     status     timestampUTC`);
    }

    data.items.forEach(item => {
      const lastStatus = item.status_history[item.status_history.length - 1];

      if (format === 'csv') {
        resume.push(`${item.taxi_id}     ${lastStatus.status}     ${lastStatus.timestampUTC}`);
      } else {
        resume.push({
          taxi_id: item.taxi_id,
          last_status: item.status_history[item.status_history.length - 1]
        });
      }
    });

    res.status(StatusCodes.OK).send(resume);
  }

  // ********************************************************
  // todo dépacer méthodes vers service

  private getCombinations(activeIndex: number) {
    if (activeIndex >= combinationList.length) {
      return;
    }
    const itere = combinationList[activeIndex];
    itere.forEach((item, index) => {
      hailFakeDataDumpController.resultats[combinationFieldsName[activeIndex]] = item;
      if (activeIndex === combinationList.length - 1) {
        hailFakeDataDumpController.jsonItems.push(JSON.parse(JSON.stringify(hailFakeDataDumpController.resultats)));
      }
      hailFakeDataDumpController.getCombinations(activeIndex + 1);
    });
  }

  private assignTaxiReason() {
    let reasonIndex: number = 0;
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      if (item.statut === 'incident_taxi') {
        item.incident_taxi_reason = taxiIncidentReason[reasonIndex];
        reasonIndex++;
        // tslint:disable-next-line: no-bitwise
        reasonIndex = reasonIndex & 3;
      } else {
        item.incident_taxi_reason = null;
      }
    }
  }

  private assignTaxisId() {
    const i: any = [];
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      if (!i[item.operator]) {
        i[item.operator] = 0;
      }
      item.taxi_id = taxisId[item.operator][i[item.operator]];
      i[item.operator]++;
      if (i[item.operator] >= taxisId[item.operator].length) {
        i[item.operator] = 0;
      }
    }
  }

  private assignOperatorName() {
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      item.operator = operatorName[item.operator];
    }
  }

  private removeOperator() {
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      delete item.operator;
    }
  }

  private assignStatusHistory() {
    let timeInMilliSecs = 0;
    let dateDay = 0;
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      const dateIn = new Date(item.date);
      if (dateDay !== dateIn.getDate()) {
        timeInMilliSecs = 7 * 60 * 60 * 1000; // millisecondes de minuit à 7 du matin
        dateDay = dateIn.getDate();
      }
      const delay = Math.floor(Math.random() * (100 - 20 + 1) + 20);
      timeInMilliSecs += delay * 1000;
      dateIn.setTime(dateIn.getTime() + timeInMilliSecs);
      item.date = undefined;
      item.status_history = [];
      let lastDate = hailFakeDataDumpController.getStatusItem(dateIn, statusSuite.common, item);
      if (statusSuite[item.statut]) {
        lastDate = hailFakeDataDumpController.getStatusItem(lastDate, statusSuite[item.statut], item);
      }
      item.statut = undefined;
    }
  }

  private assignRatingRideReason() {
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      item.rating_ride_reason = null;
    }
  }

  private groupHails() {
    let count = 10000;
    for (const item of hailFakeDataDumpController.jsonObject.items) {
      count++;
      item.id = count.toString();
    }
  }

  private getStatusItem(dateIn: Date, statusList: IStatusHistory[], item: any): Date {
    // step: string, dateIn: Date, maxDelay: number
    statusList.forEach(element => {
      const delay = Math.floor(Math.random() * (element.delayMax - element.delayMin + 1) + element.delayMin);
      dateIn.setTime(dateIn.getTime() + delay * 1000);
      item.status_history.push({
        status: element.status,
        timestampUTC: dateIn.toISOString()
      });
    });

    return dateIn;
  }

  private getDateFromString(sDate: string): Date {
    let oDate: Date;

    try {
      oDate = new Date(sDate);
    } catch {
      return null;
    }

    if (oDate.toISOString() !== sDate) {
      return null;
    }

    return oDate;
  }

  private isDateInPermittedRange(date: Date): boolean {
    const dateBegin = new Date('2019-07-01T00:00:00.000Z');
    const dateNow = new Date('2019-08-31T23:59:59.999Z');
    if (date > dateNow || date < dateBegin) {
      return false;
    }

    return true;
  }
}

export const hailFakeDataDumpController = new HailFakeDataDumpController();
