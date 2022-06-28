// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { StatusCodes } from 'http-status-codes';
import * as request from "request";
import * as shortId from 'shortid';
import { InternalServerError } from "../features/errorHandling/errors";
import { nowUtcIsoString } from '../features/shared/dateUtils/dateUtils';
import { UserRequestDto } from '../features/users/user.dto';
import { UserModel } from '../features/users/user.model';
import { userRepository } from '../features/users/user.repository';
import { UserRoleId } from '../features/users/userRole';
import { isLegacyLicensePlate } from "../features/vehicles/vehicle.dto";
import { TaxiStatus } from '../libs/taxiStatus';
import { ADSModel } from "../models/ads.response.model";
import { DepartementModel } from "../models/departement.model";
import { DriverModel } from "../models/driver.response.model";
import * as hailcases from "../models/hailcases.model";
import { GeoSendPosition, inputAds, inputDriver, inputVehicle, TaxiInputModel } from "../models/taxi.response.model";
import { VehicleModel } from "../models/vehicle.model";
import { VehicleResponseModel } from "../models/vehicle.response.model";
import { ADSService } from "../services/ads.service";
import { VehicleService } from "../services/vehicle.service";
import { getAbsoluteUrl } from "../utils/configs/system";
import { DriverService } from "./driver.service";

const uuid = require("uuid4");

export class MoteurValidatorService {
  public op_id = '';
  public api_key = '';
  public nbrTaxis = 0;

  constructor() { }

  async createOperator(userModel: UserModel) {
    // Assume an admin role to create the test operators
    userModel.role = UserRoleId.Admin;

    const seed = shortId.generate();

    const now = nowUtcIsoString()
    const firstApikey = uuid();
    const userDto = {
      commercial_name: userModel.commercial_name + '_test_operator',
      email: `${userModel.email}_${seed}_test_operator`,
      hail_endpoint_production: getAbsoluteUrl('/api/operator/endpoint'),
      operator_api_key: firstApikey,
      operator_header_name: 'X-API-KEY',
      apikey: firstApikey,
      password: firstApikey,
      role: UserRoleId.Operator,
      active: true,
      standard_booking_is_promoted_to_public: true,
      standard_booking_inquiries_starts_at: now,
      minivan_booking_is_promoted_to_public: true,
      minivan_booking_inquiries_starts_at: now,
      special_need_booking_is_promoted_to_public: true,
      special_need_booking_inquiries_starts_at: now,
    } as UserRequestDto;

    const firstOperator = await createTestOperator(userDto, userModel);

    const secondApikey = uuid();
    const userDto2 = Object.assign(userDto, {
      email: userDto.email + '_2',
      commercial_name: userDto.commercial_name + '_2',
      apikey: secondApikey,
      password: secondApikey,
    });

    const secondOperator = await createTestOperator(userDto2, userModel);

    return [firstOperator, secondOperator];
  }

  createADS(NBR_TAXIS, userModel: UserModel, lat: string, lon: string, vehicleId?: VehicleModel[]) {
    let parent = this;
    return new Promise(function (resolve, reject) {
      let adsService = new ADSService();
      let arrProm: Array<any> = new Array();

      for (var i = 0; i < NBR_TAXIS; i++) {
        let numero = shortId.generate();
        var containerJson = {};
        containerJson['data'] = [];
        containerJson['data'][0] = new ADSModel(
          '1000',
          numero,
          userModel.commercial_name + '_proprio',
          'individual',
          'perpetual',
          false,
          '97979'
        );

        arrProm.push(adsService.createADS(containerJson, userModel));
      }

      let arrResponsesData: Array<any> = new Array();
      Promise.all(arrProm)
        .then(function (responses: Array<any>) {
          responses.forEach(function (rep) {
            if (rep.statusCode == StatusCodes.OK || rep.statusCode == StatusCodes.CREATED) {
              arrResponsesData.push(JSON.parse(rep.body).data[0]);
            } else {
              reject(new InternalServerError('aucune idée... ads pas créé'));
            }
          });
          resolve(arrResponsesData);
        })
        .catch(function () {
          reject(new InternalServerError('aucune idée... ads pas créé'));
        });
    });
  }

  createDriver(NBR_TAXIS, userModel: UserModel) {
    return new Promise(function (resolve, reject) {
      const driverService = new DriverService();
      let arrProm: Array<any> = new Array();

      for (var i = 0; i < NBR_TAXIS; i++) {
        let numero =  shortId.generate();
        var containerJson = {};
        containerJson['data'] = [];
        containerJson['data'][0] = new DriverModel(
          '2017-07-18',
          new DepartementModel('Québec', '1000'),
          'Taxi',
          'Man',
          numero
        );

        arrProm.push(driverService.createDriver(containerJson, userModel));
      }

      let arrResponsesData: Array<any> = new Array();
      Promise.all(arrProm)
        .then(function (responses: Array<any>) {
          responses.forEach(function (rep) {
            if (rep.statusCode == StatusCodes.OK || rep.statusCode == StatusCodes.CREATED) {
              arrResponsesData.push(JSON.parse(rep.body).data[0]);
            } else {
              reject(new InternalServerError('aucune idée... driver pas créé'));
            }
          });
          resolve(arrResponsesData);
        })
        .catch(function () {
          reject(new InternalServerError('aucune idée... driver pas créé'));
        });
    });
  }

  createVehicule(NBR_TAXIS, userModel: UserModel) {
    return new Promise(function (resolve, reject) {
      let vehicleService = new VehicleService();
      let arrProm: Array<any> = new Array();

      for (var i = 0; i < NBR_TAXIS; i++) {
        let model = hailcases.cases[6].toString();
        if (i < Object.keys(hailcases.cases).length / 2) {
          model = hailcases.cases[i].toString();
        }

        let numero = shortId.generate();
        while (isLegacyLicensePlate(numero))
          numero = shortId.generate();
        var containerJson = {};
        containerJson['data'] = [];
        containerJson['data'][0] = new VehicleResponseModel(
          numero,
          2017,
          'hybrid',
          8,
          false,
          'sdf3445',
          'kkyy555',
          '2017-01-15',
          '2017-01-15',
          false,
          'sedan',
          true,
          true,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          'gris',
          4,
          model,
          'Toyota'
        );

        // 3e véhicule de la liste on simule un nombre de sièges passagers différents
        if (i == 3) {
          containerJson['data'][0].nb_seats = 6;
        }
        // 4e véhicule de la liste on simule un cas de véhicule adapté.
        if (i == 4) {
          containerJson['data'][0].special_need_vehicle = true;
        }
        arrProm.push(vehicleService.createVehicle(containerJson, userModel));
      }

      let arrResponsesData: Array<any> = new Array();
      Promise.all(arrProm)
        .then(function (responses: Array<any>) {
          responses.forEach(function (rep) {
            if (rep.statusCode == StatusCodes.OK || rep.statusCode == StatusCodes.CREATED) {
              arrResponsesData.push(JSON.parse(rep.body).data[0]);
            } else {
              reject(new InternalServerError('aucune idée... vehicle pas créé'));
            }
          });
          resolve(arrResponsesData);
        })
        .catch(function () {
          reject(new InternalServerError('aucune idée... vehicle pas créé'));
        });
    });
  }

  createTaxis(
    ads: Array<ADSModel>,
    driver: Array<DriverModel>,
    vehicle: Array<VehicleResponseModel>,
    userModel: UserModel
  ) {
    return new Promise(function (resolve, reject) {
      // faire une nombre de taxi équivalent au plus petit count ou j'aurais à la fois un ads,
      // un driver et un vehicle de disponible.
      let countTaxis = ads.length;
      if (driver.length < countTaxis) countTaxis = driver.length;
      if (vehicle.length < countTaxis) countTaxis = driver.length;

      let arrResponsesData: Array<any> = new Array();

      for (var i = 0; i < countTaxis; i++) {
        let myTaxi: TaxiInputModel = new TaxiInputModel(
          new inputVehicle(vehicle[i].licence_plate),
          new inputDriver(driver[i].departement.numero, driver[i].professional_licence),
          new inputAds(ads[i].insee, ads[i].numero),
          TaxiStatus.Free
        );

        arrResponsesData.push(
          new Promise(function (resolve, reject) {
            var containerJson = {};
            containerJson['data'] = [];
            containerJson['data'][0] = myTaxi;

            const options: any = {
              uri: getAbsoluteUrl('/api/taxis/'),
              headers: {
                'content-type': 'application/json',
                'X-VERSION': '2',
                Accept: 'application/json',
                'X-API-KEY': userModel.apikey
              },
              body: JSON.stringify(containerJson)
            };

            request.post(options, function (err, response) {
              if (err) {
                reject(err);
              } else {
                resolve(response);
              }
            });
          })
        );
      }

      let arrResultData: Array<any> = new Array();
      Promise.all(arrResponsesData)
        .then(function (responses: Array<any>) {
          let i = 0;
          responses.forEach(function (rep) {
            if (rep.statusCode == StatusCodes.OK || rep.statusCode == StatusCodes.CREATED) {
              arrResultData.push(JSON.parse(rep.body)['data'][0]);
              arrResultData[arrResultData.length - 1].vehicle.nb_seats = vehicle[i].nb_seats;
              let lstCharacteristics: Array<any> = new Array();
              lstCharacteristics.push(
                ...(typeof vehicle[i].luxury == 'undefined' || vehicle[i].luxury == false ? [] : ['luxury']),
                ...(typeof vehicle[i].credit_card_accepted == 'undefined' ||
                  vehicle[i].credit_card_accepted == false
                  ? []
                  : ['credit_card_accepted']),
                ...(typeof vehicle[i].nfc_cc_accepted == 'undefined' || vehicle[i].nfc_cc_accepted == false
                  ? []
                  : ['nfc_cc_accepted']),
                ...(typeof vehicle[i].amex_accepted == 'undefined' || vehicle[i].amex_accepted == false
                  ? []
                  : ['amex_accepted']),
                ...(typeof vehicle[i].bank_check_accepted == 'undefined' ||
                  vehicle[i].bank_check_accepted == false
                  ? []
                  : ['bank_check_accepted']),
                ...(typeof vehicle[i].fresh_drink == 'undefined' || vehicle[i].fresh_drink == false
                  ? []
                  : ['fresh_drink']),
                ...(typeof vehicle[i].dvd_player == 'undefined' || vehicle[i].dvd_player == false
                  ? []
                  : ['dvd_player']),
                ...(typeof vehicle[i].tablet == 'undefined' || vehicle[i].tablet == false ? [] : ['tablet']),
                ...(typeof vehicle[i].wifi == 'undefined' || vehicle[i].wifi == false ? [] : ['wifi']),
                ...(typeof vehicle[i].baby_seat == 'undefined' || vehicle[i].baby_seat == false
                  ? []
                  : ['baby_seat']),
                ...(typeof vehicle[i].bike_accepted == 'undefined' || vehicle[i].bike_accepted == false
                  ? []
                  : ['bike_accepted']),
                ...(typeof vehicle[i].pet_accepted == 'undefined' || vehicle[i].pet_accepted == false
                  ? []
                  : ['pet_accepted']),
                ...(typeof vehicle[i].air_con == 'undefined' || vehicle[i].air_con == false ? [] : ['air_con']),
                ...(typeof vehicle[i].electronic_toll == 'undefined' || vehicle[i].electronic_toll == false
                  ? []
                  : ['electronic_toll']),
                ...(typeof vehicle[i].gps == 'undefined' || vehicle[i].gps == false ? [] : ['gps']),
                ...(typeof vehicle[i].cpam_conventionne == 'undefined' || vehicle[i].cpam_conventionne == false
                  ? []
                  : ['cpam_conventionne']),
                ...(typeof vehicle[i].every_destination == 'undefined' || vehicle[i].every_destination == false
                  ? []
                  : ['every_destination']),
                ...(typeof vehicle[i].special_need_vehicle == 'undefined' ||
                  vehicle[i].special_need_vehicle == false
                  ? []
                  : ['special_need_vehicle'])
              );
              arrResultData[arrResultData.length - 1].vehicle.characteristics = lstCharacteristics;
              i++;
            } else {
              reject(new InternalServerError(`Erreur création taxi: ${rep.body}`));
            }
          });
          resolve(arrResultData);
        })
        .catch((err) => reject(new InternalServerError(`Erreur création taxi: ${err}`)));
    });
  }

  callGeoserveur(lstTaxis: Array<any>, lat, lon, userModel, isFixedPosition = false) {
    var parent = this;
    return new Promise(function (resolve, reject) {
      let i: number = 0;
      var containerJson = {};
      containerJson['items'] = [];

      lstTaxis.forEach(element => {
        let currentUTC = ('' + new Date().getTime() / 1000).split('.')[0];
        let rdnLon = Math.floor(Math.random() * 1000);
        let rdnLat = Math.floor(Math.random() * 1000);
        rdnLat = parseFloat(lat) + rdnLat / 1000000;
        rdnLon = parseFloat(lon) + rdnLon / 1000000;

        if (isFixedPosition) {
          rdnLat = lat;
          rdnLon = lon;
        } else {
          element.crowfly_distance = parent.calculateDistance(lat, lon, rdnLat, rdnLon);
        }

        element.position.lat = rdnLat;
        element.position.lon = rdnLon;
        element.operator = userModel.email;

        containerJson['items'][i++] = new GeoSendPosition(
          element.id,
          rdnLat,
          rdnLon,
          userModel.email,
          currentUTC,
          TaxiStatus.Free,
          '2',
          10,
          180
        );
      });

      const options: any = {

        uri: getAbsoluteUrl('/api/taxi-position-snapshots'),
        headers: {
          "content-type": "application/json",
          "X-VERSION": "2",
          Accept: "application/json",
          "X-API-KEY": userModel.apikey
        },
        body: JSON.stringify(containerJson)
      };

      request.post(options, function (err, response) {
        if (err) {
          reject(err);
        } else {
          if (response.statusCode == StatusCodes.OK) {
            resolve(response);
          } else {
            reject(response.statusMessage);
          }
        }
      });
    });
  }

  CreateTaxiDoublon(objTaxi, lat, lon, userModel) {
    return new Promise(function (resolve, reject) {
      let driverService = new DriverService();
      var containerJson = {};
      containerJson['data'] = [];
      containerJson['data'][0] = new DriverModel(
        '2017-07-18',
        new DepartementModel('Québec', '1000'),
        'Taxi',
        'Man',
        objTaxi.driver.professional_licence
      );
      driverService.createDriver(containerJson, userModel).then(function (driver: any) {
        let vehicleService = new VehicleService();
        var containerJson = {};
        containerJson['data'] = [];
        containerJson['data'][0] = new VehicleResponseModel(
          objTaxi.vehicle.licence_plate,
          2017,
          'hybrid',
          8,
          false,
          'sdf3445',
          'kkyy555',
          '2017-01-15',
          '2017-01-15',
          false,
          'sedan',
          true,
          true,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          'gris',
          4,
          hailcases.cases[0].toString(),
          'Toyota'
        );

        vehicleService.createVehicle(containerJson, userModel).then(function (vehicle: any) {

          var containerJson = {};
          containerJson['data'] = [];
          containerJson['data'][0] = new ADSModel(
            '1000',
            objTaxi.ads.numero,
            userModel.commercial_name + '_proprio',
            'individual',
            'perpetual',
            false,
            '97979'
          );

          let adsService = new ADSService();
          adsService.createADS(containerJson, userModel).then(function (ads: any) {


            let myVehicle: any = JSON.parse(vehicle.body).data[0];
            let myAds: any = JSON.parse(ads.body).data[0];
            let myDriver: any = JSON.parse(driver.body).data[0];

            let myTaxi: TaxiInputModel = new TaxiInputModel(
              new inputVehicle(myVehicle.licence_plate),
              new inputDriver(myDriver.departement.numero, myDriver.professional_licence),
              new inputAds(myAds.insee, myAds.numero),
              TaxiStatus.Free
            );
            containerJson = {};
            containerJson['data'] = [];
            containerJson['data'][0] = myTaxi;

            const options: any = {
              uri: getAbsoluteUrl('/api/taxis/'),
              headers: {
                'content-type': 'application/json',
                'X-VERSION': '2',
                Accept: 'application/json',
                'X-API-KEY': userModel.apikey
              },
              body: JSON.stringify(containerJson)
            };

            request.post(options, function (err, response) {
              if (err) {
                reject(err);
              } else {
                var respJson = JSON.parse(response.body);
                respJson.data[0].vehicle.nb_seats = myVehicle.nb_seats;
                respJson.data[0].vehicle.color = myVehicle.color;
                respJson.data[0].vehicle.constructor = myVehicle.constructor;
                let lstCharacteristics: Array<any> = new Array();
                lstCharacteristics.push(
                  ...(typeof myVehicle.luxury == 'undefined' || myVehicle.luxury == false ? [] : ['luxury']),
                  ...(typeof myVehicle.credit_card_accepted == 'undefined' || myVehicle.credit_card_accepted == false
                    ? []
                    : ['credit_card_accepted']),
                  ...(typeof myVehicle.nfc_cc_accepted == 'undefined' || myVehicle.nfc_cc_accepted == false
                    ? []
                    : ['nfc_cc_accepted']),
                  ...(typeof myVehicle.amex_accepted == 'undefined' || myVehicle.amex_accepted == false
                    ? []
                    : ['amex_accepted']),
                  ...(typeof myVehicle.bank_check_accepted == 'undefined' || myVehicle.bank_check_accepted == false
                    ? []
                    : ['bank_check_accepted']),
                  ...(typeof myVehicle.fresh_drink == 'undefined' || myVehicle.fresh_drink == false
                    ? []
                    : ['fresh_drink']),
                  ...(typeof myVehicle.dvd_player == 'undefined' || myVehicle.dvd_player == false
                    ? []
                    : ['dvd_player']),
                  ...(typeof myVehicle.tablet == 'undefined' || myVehicle.tablet == false ? [] : ['tablet']),
                  ...(typeof myVehicle.wifi == 'undefined' || myVehicle.wifi == false ? [] : ['wifi']),
                  ...(typeof myVehicle.baby_seat == 'undefined' || myVehicle.baby_seat == false ? [] : ['baby_seat']),
                  ...(typeof myVehicle.bike_accepted == 'undefined' || myVehicle.bike_accepted == false
                    ? []
                    : ['bike_accepted']),
                  ...(typeof myVehicle.pet_accepted == 'undefined' || myVehicle.pet_accepted == false
                    ? []
                    : ['pet_accepted']),
                  ...(typeof myVehicle.air_con == 'undefined' || myVehicle.air_con == false ? [] : ['air_con']),
                  ...(typeof myVehicle.electronic_toll == 'undefined' || myVehicle.electronic_toll == false
                    ? []
                    : ['electronic_toll']),
                  ...(typeof myVehicle.gps == 'undefined' || myVehicle.gps == false ? [] : ['gps']),
                  ...(typeof myVehicle.every_destination == 'undefined' || myVehicle.every_destination == false
                    ? []
                    : ['every_destination']),
                  ...(typeof myVehicle.special_need_vehicle == 'undefined' || myVehicle.special_need_vehicle == false
                    ? []
                    : ['special_need_vehicle'])
                );
                respJson.data[0].vehicle.characteristics = lstCharacteristics;
                resolve(respJson);
              }
            });
          });
        });
      });
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number):number {
    const earthRadiusKm = 6371;
    const latitudeRad = this.deg2rad(lat2 - lat1);
    const longitudeRad = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(latitudeRad / 2) * Math.sin(latitudeRad / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(longitudeRad / 2) * Math.sin(longitudeRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;
    return distanceKm;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

async function createTestOperator(userDto: UserRequestDto, userModel: UserModel): Promise<UserModel> {
  const responseDto = await userRepository.createUser(userDto, userModel);
  return Object.assign(new UserModel(), responseDto);
}