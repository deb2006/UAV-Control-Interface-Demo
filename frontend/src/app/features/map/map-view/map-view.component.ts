import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { Observable, Subscription } from 'rxjs';
import { TelemetryFrame } from '../../../store/telemetry/telemetry.state';
import { Waypoint } from '../../../store/mission/mission.state';
import { UAV } from '../../../store/uav/uav.state';
import { addWaypoint } from '../../../store/mission/mission.actions';
import { TelemetryService } from '../../../core/services/telemetry.service';

@Component({
    selector: 'app-map-view',
    standalone: true,
    imports: [CommonModule],
    template: `<div id="map" class="map-container"></div>`,
    styles: [`
    .map-container {
      height: 100%;
      width: 100%;
      background: #0a0e1a;
    }
    :host ::ng-deep .leaflet-container {
      background: #0a0e1a;
      font-family: var(--font-ui);
    }
  `]
})
export class MapViewComponent implements OnInit, OnDestroy, AfterViewInit {
    private map!: L.Map;
    private uavMarker!: L.Marker;
    private trail!: L.Polyline;
    private waypointMarkers: L.Marker[] = [];
    private missionLine!: L.Polyline;
    private subs = new Subscription();
    private telemetryService = inject(TelemetryService);
    private uavs$: Observable<UAV[]> = inject(Store).select((s: any) => s.uav.uavs);
    private selectedUavId?: number;

    constructor(private store: Store) { }

    ngOnInit() {
        this.subs.add(this.store.select((s: any) => s.uav.selected).subscribe(uav => {
            if (uav) this.selectedUavId = uav.id;
        }));
    }

    ngAfterViewInit() {
        this.initMap();
        this.setupSubscriptions();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
        if (this.map) {
            this.map.remove();
        }
    }

    private initMap() {
        // Delhi, India as starting point
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([28.6139, 77.209], 15);

        // Use a dark map tile set (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(this.map);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        // UAV Icon (Professional Green Triangle)
        const uavIcon = L.divIcon({
            className: 'uav-marker-icon',
            html: `
                <div class="uav-icon-wrapper" style="transform: rotate(0deg);">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="#00ff00" stroke="#004400" stroke-width="1"/>
                        <circle cx="12" cy="14" r="2" fill="white" opacity="0.5"/>
                    </svg>
                </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        this.uavMarker = L.marker([28.6139, 77.209], { icon: uavIcon }).addTo(this.map);

        // Trail
        this.trail = L.polyline([], {
            color: 'var(--color-success)',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 5'
        }).addTo(this.map);

        // Mission line
        this.missionLine = L.polyline([], {
            color: 'var(--color-warning)',
            weight: 2,
            opacity: 0.8
        }).addTo(this.map);

        // Click to add waypoint
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.store.dispatch(addWaypoint({
                waypoint: {
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                    altitude: 50,
                    speed: 15,
                    actionType: 'waypoint',
                    sequenceOrder: 0 // Will be corrected by reducer/service
                }
            }));
        });

        // Right-click to set home
        this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
            if (this.selectedUavId) {
                this.telemetryService.setHome(this.selectedUavId, e.latlng.lat, e.latlng.lng);
            }
        });
    }

    private setupSubscriptions() {
        // Current UAV position & Movement progress
        this.subs.add(
            this.store.select((s: any) => s.telemetry.current).subscribe((tel: TelemetryFrame) => {
                if (tel) {
                    const pos: L.LatLngExpression = [tel.latitude, tel.longitude];
                    this.uavMarker.setLatLng(pos);

                    // Update icon rotation
                    const icon = this.uavMarker.getElement();
                    if (icon) {
                        const wrapper = icon.querySelector('.uav-icon-wrapper') as HTMLElement;
                        if (wrapper) wrapper.style.transform = `rotate(${tel.yaw}deg)`;
                    }

                    // Update waypoint colors in real-time
                    this.store.select((s: any) => s.mission.waypoints).subscribe(wps => {
                        this.updateWaypointsOnMap(wps, tel.reachedWaypoints || []);
                    }).unsubscribe();
                }
            })
        );

        // History trail
        this.subs.add(
            this.store.select((s: any) => s.telemetry.buffer).subscribe((buffer: TelemetryFrame[]) => {
                const points = buffer.map(f => [f.latitude, f.longitude] as L.LatLngExpression);
                this.trail.setLatLngs(points);
            })
        );

        // Waypoints for planning
        this.subs.add(
            this.store.select((s: any) => s.mission.waypoints).subscribe((waypoints: Waypoint[]) => {
                this.updateWaypointsOnMap(waypoints);
            })
        );
    }

    private updateWaypointsOnMap(waypoints: Waypoint[], reachedIndices: number[] = []) {
        // Clear old markers
        this.waypointMarkers.forEach(m => m.remove());
        this.waypointMarkers = [];

        const latlngs: L.LatLngExpression[] = [];

        waypoints.forEach((wp, i) => {
            const pos: L.LatLngExpression = [wp.latitude, wp.longitude];
            latlngs.push(pos);

            const isReached = reachedIndices.includes(i);
            const color = isReached ? '#00ff00' : 'var(--color-warning)';

            const marker = L.circleMarker(pos, {
                radius: 6,
                color: color,
                fillColor: color,
                fillOpacity: 1
            }).addTo(this.map).bindTooltip(`WP ${i + 1}${isReached ? ' (REACHED)' : ''}`, { permanent: true, direction: 'top' });

            this.waypointMarkers.push(marker as any);
        });

        this.missionLine.setLatLngs(latlngs);
    }
}
