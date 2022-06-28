// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { linesStringFromGeojsonPath } from '../../../helper/lineStringFromGeojsonPath';
import { TaxisService } from 'app/services/taxis.service';
import { ITaxiDetails } from '../services/ITaxiDetails';
import { IPathPoint } from './IPathPoint';
import { ITaxiSnapshot } from './ITaxiSnapshot';
import { pointsFromGeojsonPath } from '../../../helper/pointsFromGeojsonPath';
import { taxiMarkerIcon, taxiPathStyle, taxiPointsStyle } from './style';

import { mtlMap } from '../../config/mtlMap';
import { getStamenTonerLayer } from '../shared/map/layer';

declare var L: any;

@Component({
  selector: 'app-taxi-path-map',
  templateUrl: './taxi-path-map.component.html',
  styleUrls: ['./taxi-path-map.component.css']
})
export class TaxiPathMapComponent implements OnInit {
  @ViewChild('sidebarDatePicker') smFiltre: ElementRef;
  @ViewChild('sidebarTaxiDetails') smDetails: ElementRef;

  currentTaxi: ITaxiDetails;
  geojsonPath: any;
  map: any;
  pathLineString: any;
  pathPoints: any[];
  pathPointsIndex = 0;
  pathPointsLayer: any;
  selectedTaxiId: string;
  selectedTaxiMarker: any;
  sidebarDatePicker: any;
  sidebarTaxiDetails: any;
  taxiMarker: any;
  taxipath: any;
  taxiSnapshot: ITaxiSnapshot;

  constructor(
    private activatedRoute: ActivatedRoute,
    private taxisService: TaxisService
  ) {}

  public async ngOnInit() {
    this.initTaxiMarkerIcons();
    await this.initTaxiId();
    await this.initMap();
    this.pathPointsIndex = 0;
  }

  private displayPath($event: any): void {
    this.erasePath();
    const geojsonPath = JSON.parse($event);
    this.pathLineString = linesStringFromGeojsonPath(geojsonPath);
    this.pathPoints = pointsFromGeojsonPath(geojsonPath);

    this.pathPointsLayer = L.geoJSON(this.pathPoints, {
      pointToLayer: (feature: IPathPoint, latlng: number[]) =>
        L.circleMarker(latlng, taxiPointsStyle)
    });
    this.pathPointsLayer.on('click', ({ layer: { feature } }) => {
      this.pathPointsIndex = feature.index;
      this.updateTaxiMarker(feature);
    });
    this.pathPointsLayer.addTo(this.map);

    this.taxipath = L.geoJSON(this.pathLineString, taxiPathStyle).addTo(
      this.map
    );
    this.initTaxiMarker(this.pathPoints);
  }

  private erasePath(): void {
    this.pathPointsIndex = 0;
    if (this.taxipath) {
      this.map.removeLayer(this.taxipath);
    }
    if (this.pathPointsLayer) {
      this.map.removeLayer(this.pathPointsLayer);
    }
    if (this.selectedTaxiMarker) {
      this.map.removeLayer(this.selectedTaxiMarker);
    }
  }

  private initTaxiMarkerIcons(): void {
    this.taxiMarker = L.icon(taxiMarkerIcon);
  }

  private async initMap(): Promise<void> {
    const layer = getStamenTonerLayer();
    this.map = new L.Map('map', mtlMap);
    this.map.addLayer(layer);

    this.recallLeftPane();
    this.recallRightPane();

    L.easyButton('fa-search', () => this.sidebarDatePicker.show()).addTo(
      this.map
    );
  }

  private recallLeftPane(): void {
    this.initSidebar(
      this.map,
      this.sidebarDatePicker,
      'sidebar-date-picker',
      'left',
      true
    );
  }

  private recallRightPane(): void {
    this.initSidebar(
      this.map,
      this.sidebarTaxiDetails,
      'sidebar-taxi-details',
      'right',
      true
    );
  }

  private initSidebar(
    map: any,
    sidebar: any,
    sidebarId: string,
    position: string,
    closeButton: boolean
  ): void {
    sidebar = L.control.sidebar(sidebarId, { position, closeButton });
    map.addControl(sidebar);
    sidebar.show();
  }

  private initTaxiMarker(pathPoints: IPathPoint[]): void {
    const firstPoint = pathPoints[0];
    const {
      geometry: {
        coordinates: [long, lat]
      }
    } = firstPoint;
    this.updateTaxiSnapshot(firstPoint);
    this.selectedTaxiMarker = L.marker([lat, long], {
      icon: this.taxiMarker
    });
    this.selectedTaxiMarker.addTo(this.map);
  }

  private async initTaxiId(): Promise<void> {
    this.selectedTaxiId = this.activatedRoute.snapshot.queryParams.taxiId;
    this.currentTaxi = await this.taxisService.getTaxiDetailsAsync(
      this.selectedTaxiId,
      this.activatedRoute.snapshot.queryParams.operatorApiKey
    );
  }

  private updateTaxiMarker(feature: IPathPoint): void {
    const { geometry } = feature;
    const {
      coordinates: [long, lat]
    } = geometry;
    const newLatLong = new L.LatLng(lat, long);
    this.selectedTaxiMarker.setLatLng(newLatLong);
    this.selectedTaxiMarker.addTo(this.map);

    this.updateTaxiSnapshot(feature);
  }

  private updateTaxiSnapshot(feature: IPathPoint): void {
    const {
      geometry,
      properties: { status, timestampUTC, azimuth, speed }
    } = feature;
    const {
      coordinates: [longitude, latitude]
    } = geometry;
    const taxiSnapshot: ITaxiSnapshot = {
      latitude,
      longitude,
      status,
      timestampUTC,
      azimuth,
      speed
    };
    this.taxiSnapshot = taxiSnapshot;
  }

  private updateTaxiSnapshotWidget(step: number): void {
    while (
      this.pathPoints[this.pathPointsIndex] &&
      this.pathPoints[this.pathPointsIndex + step] &&
      this.areCoordinatesEquals(
        this.pathPoints[this.pathPointsIndex].geometry.coordinates,
        this.pathPoints[this.pathPointsIndex + step].geometry.coordinates
      )
    ) {
      if (!this.canStepBeIncrementedOrDecremented(step)) {
        return;
      }
      step = this.incrementOrDecrementStep(step);
    }

    if (!this.canStepBeIncrementedOrDecremented(step)) {
      return;
    }
    this.pathPointsIndex = this.pathPointsIndex + step;
    const [newPathPoint]: IPathPoint[] = this.pathPoints.slice(
      this.pathPointsIndex,
      this.pathPointsIndex + 1
    );
    this.updateTaxiMarker(newPathPoint);
  }

  private areCoordinatesEquals(coords0: number[], coords1: number[]) {
    const longitude = 0;
    const latitude = 1;
    if (
      coords0[longitude] === coords1[longitude] &&
      coords0[latitude] === coords1[latitude]
    ) {
      return true;
    }

    return false;
  }

  private canStepBeIncrementedOrDecremented(step: number): boolean {
    if (step > 0) {
      if (this.pathPointsIndex + step >= this.pathPoints.length) {
        this.pathPointsIndex = this.pathPoints.length - 1;
        return false;
      }
    } else {
      if (this.pathPointsIndex + step <= 0) {
        this.pathPointsIndex = 0;
        return false;
      }
    }

    return true;
  }

  private incrementOrDecrementStep(step: number): number {
    if (step > 0) {
      step++;
    } else if (step < 0) {
      step--;
    }

    return step;
  }
}
