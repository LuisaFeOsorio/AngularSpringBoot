import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import mapboxgl, { LngLatLike, Map, Marker, MapMouseEvent } from 'mapbox-gl';
import { MarkerDTO } from '../model/marker-dto';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnDestroy {

  private map?: Map;
  private markers: Marker[] = [];
  private currentLocation: LngLatLike = [-75.6727, 4.53252];
  private readonly MAPBOX_TOKEN = 'pk.eyJ1IjoibHVpc2Fvc29yaW8iLCJhIjoiY21mNWpsNDVnMDVhNDJpb2d1dW8zY253ZyJ9.-wEf3GrwebxkNu3Wr6_SDg';
  private destroy$ = new Subject<void>();

  constructor() {
    mapboxgl.accessToken = this.MAPBOX_TOKEN;
  }

  /** Inicializa el mapa dentro del contenedor especificado */
  public create(containerId: string = 'map'): void {
    if (this.map) {
      this.map.remove(); // Evita fugas si se recrea el mapa
    }

    this.map = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/standard',
      center: this.currentLocation,
      zoom: 17,
      pitch: 45,
    });

    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      })
    );
  }
  /** Escucha un click en el mapa y devuelve lat/lng */
  public onMapClick(): Observable<{ lat: number; lng: number }> {
    const subject = new Subject<{ lat: number; lng: number }>();

    if (!this.map) return subject.asObservable();

    this.map.on('click', (event: MapMouseEvent) => {
      const { lng, lat } = event.lngLat;
      subject.next({ lat, lng });
    });

    return subject.asObservable();
  }

  public get mapInstance(): Map | undefined {
    return this.map;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
