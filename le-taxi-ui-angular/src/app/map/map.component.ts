// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import {
  Component, ElementRef,
  OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { interval } from 'rxjs/observable/interval';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';
import { catchError, debounce, map, switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { Operator } from '../data/operator.d';
import { TaxiArea } from '../data/taxiArea.d';
import { MapService } from '../services/map.service';
import { getStamenTonerLayer } from '../shared/map/layer';
import {
  leftSideMenuOptions, mapOptions, rightSideMenuOptions, taxiAreaIcon, yellowIcon
} from './map.component.style';
import { createMapSearchTerms } from './mapSearchTerms';

declare var L: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('sidebarTaxi') smDetails: ElementRef;
  @ViewChild('sideMenuFilters') smFiltre: ElementRef;

  map: any;
  clusters: any;
  yellowIcon: any;
  taxiAreaIcon: any;
  taxiAreasLayerGroup: any;
  selectedTaxi: any;
  selectedTaxiArea: TaxiArea;
  sidebarTaxiDetails: any;
  sidebarTaxiArea: any;
  sideMenuFilters: any;
  errorMessage: string;

  // Used to init the operator combo because the md-select default value can only be bound at runtime
  defaultOperator = 'all';

  operators$: Observable<Operator[]>;

  private operatorSubject = new BehaviorSubject<string>('all');
  operatorAction$ = this.operatorSubject.asObservable();
  private searchModeSubject = new BehaviorSubject<string>('byLicencePlate');
  searchModeAction$ = this.searchModeSubject.asObservable();
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTermAction$ = this.searchTermSubject.asObservable();
  private taxiAreaVisibleSubject = new BehaviorSubject<boolean>(false);
  taxiAreaVisibleAction$ = this.taxiAreaVisibleSubject.asObservable();

  private pageSubscriptions: Subscription = new Subscription();

  constructor(
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.initMap();
    this.initQueryParams();
    this.initObservables();
  }

  ngOnDestroy() {
    this.pageSubscriptions.unsubscribe();
  }

  private initMap(): void {
    this.map = new L.Map('map', mapOptions);
    this.map.addLayer(getStamenTonerLayer());

    this.sideMenuFilters = L.control.sidebar(
      'sideMenuFilters',
      leftSideMenuOptions
    );
    this.map.addControl(this.sideMenuFilters);
    this.sidebarTaxiDetails = L.control.sidebar(
      'sidebarTaxiDetails',
      rightSideMenuOptions
    );
    this.map.addControl(this.sidebarTaxiDetails);
    this.sidebarTaxiArea = L.control.sidebar(
      'sidebarTaxiArea',
      rightSideMenuOptions
    );
    this.map.addControl(this.sidebarTaxiArea);

    this.yellowIcon = L.icon(yellowIcon);
    this.taxiAreaIcon = L.icon(taxiAreaIcon);

    L.easyButton('fa-search', () => this.sideMenuFilters.show()).addTo(
      this.map
    );
  }

  private initQueryParams(): void {
    const licencePlate = this.route.snapshot.queryParamMap.get('licencePlate');
    const professionalLicence = this.route.snapshot.queryParamMap.get(
      'professionalLicence'
    );

    if (licencePlate) {
      this.searchModeSubject.next('byLicencePlate');
      this.searchTermSubject.next(licencePlate);
    } else if (professionalLicence) {
      this.searchModeSubject.next('byProfessionalLicence');
      this.searchTermSubject.next(professionalLicence);
    }

    if (licencePlate || professionalLicence) {
      this.sideMenuFilters.show();
    }
  }

  private initObservables(): void {
    // Subscription handled by async pipe in html
    this.operators$ = this.buildOperatorObservable();

    // Long-lived observable
    const taxiAreas$ = combineLatest([
      this.buildTaxiAreaObservable(),
      this.taxiAreaVisibleAction$
    ]).pipe(tap(([taxiAreas, visible]) => this.toggleTaxiArea(visible)));

    // Long-lived observable that triggers the taxi-search on change detection
    const searchResults$ = combineLatest([
      this.operatorAction$,
      this.searchModeAction$,
      this.searchTermAction$
    ]).pipe(
      debounce(() => interval(250)),
      tap(([operator, mode, term]) => this.updateNavigation(mode, term)),
      switchMap(([operator, mode, term]) =>
        this.buildTaxiSearchObservable(mode, term).pipe(
          map(taxiSearch => ({
            operator,
            mode,
            term,
            results: taxiSearch
              .filter(ts => ts && ts.id)
              .map(ts => ts.id)
          }))
        )
      )
    );

    // Long-lived observable that handles the merging of taxi-positions and taxi-search
    const taxiPositions$ = this.buildTaxiPositionsObservable();
    const mergedResults$ = combineLatest([taxiPositions$, searchResults$]).pipe(
      catchError(e => {
        this.errorMessage = `Erreur serveur ${e}`;
        this.sideMenuFilters.show();
        return of();
      }),
      map(([taxiPositions, searchResults]) => {
        const filteredTaxiPositions = Object.assign({}, taxiPositions);
        if (filteredTaxiPositions && filteredTaxiPositions.features) {
          if (searchResults.operator !== 'all') {
            filteredTaxiPositions.features = filteredTaxiPositions.features.filter(
              f =>
                f &&
                f.properties &&
                f.properties.taxi &&
                f.properties.taxi.operatorId === searchResults.operator
            );
          }
          if (searchResults.term) {
            filteredTaxiPositions.features = filteredTaxiPositions.features.filter(
              f =>
                f &&
                f.properties &&
                searchResults.results.some(sr => sr === f.properties.taxiId)
            );
          }
        }
        return [filteredTaxiPositions, searchResults];
      }),
      tap(([taxiPositions]) => {
        this.errorMessage =
          !taxiPositions ||
          !taxiPositions.features ||
          taxiPositions.features.length === 0
            ? 'Aucun résultat'
            : '';
        if (this.errorMessage) {
          this.sideMenuFilters.show();
        }
        this.drawMarkers(taxiPositions);
      })
    );

    this.pageSubscriptions.add(taxiAreas$.subscribe());
    this.pageSubscriptions.add(mergedResults$.subscribe());
  }

  private buildOperatorObservable(): Observable<Operator[]> {
    return this.mapService
      .getOperators()
      .pipe(
        map(operators =>
          operators.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          )
        )
      );
  }

  private buildTaxiAreaObservable(): Observable<any> {
    return this.mapService.getTaxiAreas().pipe(
      map(
        taxiAreas =>
          taxiAreas &&
          taxiAreas.features &&
          taxiAreas.features.map(
            ({ properties: taxiArea }) =>
              L.marker(
                [taxiArea.Lat, taxiArea.Long],
                { icon: this.taxiAreaIcon },
                { title: taxiArea.Nom }
              ).on('click', () => {
                this.selectedTaxiArea = taxiArea;
                this.sidebarTaxiDetails.hide();
                this.sidebarTaxiArea.show();
              }) || []
          )
      ),
      tap(taxiAreas => (this.taxiAreasLayerGroup = L.layerGroup(taxiAreas)))
    );
  }

  private buildTaxiPositionsObservable(): Observable<any> {
    return timer(0, 5000).pipe(switchMap(() => this.mapService.getPositions()));
  }

  private buildTaxiSearchObservable(
    mode: string,
    term: string
  ): Observable<any> {
    return term === ''
      ? of([])
      : mode === 'byProfessionalLicence'
      ? this.mapService.searchByProfessionalLicence(term)
      : mode === 'byLicencePlate'
      ? this.mapService.searchByLicencePlate(term)
      : of([]);
  }

  private buildTaxiDetailsObservable(taxiId: string): Observable<any> {
    return this.mapService
      .getTaxiDetails(taxiId)
      .pipe(map(taxis => taxis && taxis[0]));
  }

  private drawMarkers(result: any): void {
    if (this.clusters) {
      this.map.removeLayer(this.clusters);
    }
    if (result && result.features) {
      const selectedMarker = L.geoJSON(result, {
        pointToLayer: (feature, latlng) =>
          L.marker(latlng, { icon: this.yellowIcon })
      });

      this.clusters = L.markerClusterGroup();
      this.clusters.addLayer(selectedMarker);
      this.map.addLayer(this.clusters);

      selectedMarker.on('click', (event: any) =>
        this.updateTaxiInfo(event.layer.feature.properties.taxiId)
      );
    }
  }

  private toggleTaxiArea(visible: boolean): void {
    if (visible) {
      this.taxiAreasLayerGroup.addTo(this.map);
    } else {
      this.map.removeLayer(this.taxiAreasLayerGroup);
    }
  }

  private updateTaxiInfo(taxiId: string): void {
    this.pageSubscriptions.add(
      this.buildTaxiDetailsObservable(taxiId || this.selectedTaxi.id)
        .pipe(
          tap(taxiDetails => {
            this.selectedTaxi = taxiDetails;
            this.sidebarTaxiArea.hide();
            this.sidebarTaxiDetails.show();
          })
        )
        .subscribe()
    );
  }

  private updateNavigation(mode: string, term: string): void {
    const params = { queryParams: createMapSearchTerms(), replaceUrl: true };
    params.queryParams.licencePlate =
      (mode === 'byLicencePlate' && term) || null;
    params.queryParams.professionalLicence =
      (mode === 'byProfessionalLicence' && term) || null;
    this.router.navigate([], params);
  }

  private onOperatorChanged(operator: string): void {
    this.operatorSubject.next(operator || 'all');
  }

  private onSearchTermChanged(term: string): void {
    this.searchTermSubject.next(term || '');
  }

  private onSearchModeChanged(mode: string): void {
    this.searchModeSubject.next(mode);
  }

  private onTaxiAreasVisibleChanged(visible: boolean): void {
    this.taxiAreaVisibleSubject.next(visible);
  }
}
