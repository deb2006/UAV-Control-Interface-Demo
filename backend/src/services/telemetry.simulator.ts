import { Mission } from '../models/Mission';

export interface TelemetryFrame {
    uavId: number;
    latitude: number;
    longitude: number;
    altitude: number;
    battery: number;
    airspeed: number;
    roll: number;
    pitch: number;
    yaw: number;
    flightMode: string;
    signalStrength: number;
    cpuUsage: number;
    temperature: number;
    reachedWaypoints: number[];
    missionCompleted?: boolean;
    timestamp: Date;
}

const FLIGHT_MODES = ['STABILIZE', 'AUTO', 'GUIDED', 'RTL', 'LOITER'];

// Starting position over Delhi, India
const BASE_LAT = 28.6139;
const BASE_LNG = 77.209;

export class TelemetrySimulator {
    private uavId: number;
    private lat: number = BASE_LAT;
    private lng: number = BASE_LNG;
    private alt: number = 100;
    private battery = 98;
    private intervalId?: NodeJS.Timeout;
    private waypoints: any[] = [];
    private reachedWpIndices: number[] = [];
    private currentWpIndex = -1;
    private currentYaw = 0;
    private overrideAlt?: number;
    private overrideSpeed?: number;
    public frameCount = 0;

    constructor(uavId: number) {
        this.uavId = uavId;
    }

    setWaypoints(wps: any[]) {
        this.waypoints = wps.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        this.reachedWpIndices = [];
        if (this.waypoints.length > 0) {
            this.currentWpIndex = 0;
            console.log(`📡 UAV ${this.uavId} received mission with ${wps.length} waypoints.`);
        }
    }

    setParams(params: { altitude?: number, airspeed?: number }) {
        if (params.altitude !== undefined) this.overrideAlt = params.altitude;
        if (params.airspeed !== undefined) this.overrideSpeed = params.airspeed;
    }

    performAction(action: string) {
        console.log(`🔥 [TACTICAL ACTION] UAV ${this.uavId} executing: ${action}`);
        // In a real system, this would change state or trigger hardware
    }

    setHome(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
        this.currentWpIndex = -1; // Reset mission if any
        this.waypoints = [];
        this.reachedWpIndices = [];
        console.log(`🏠 UAV ${this.uavId} Home set to: ${lat}, ${lng}`);
    }

    setIntervalId(id: NodeJS.Timeout) {
        this.intervalId = id;
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    next(): TelemetryFrame {
        this.frameCount++;

        // Slowly drain battery
        if (this.frameCount % 50 === 0 && this.battery > 10) this.battery -= 0.1;

        let flightMode = 'LOITER';
        let targetYaw = this.currentYaw;

        if (this.currentWpIndex >= 0 && this.currentWpIndex < this.waypoints.length) {
            flightMode = 'AUTO';
            const target = this.waypoints[this.currentWpIndex];

            // Simple linear move towards target
            const currentSpeed = this.overrideSpeed !== undefined ? this.overrideSpeed : (target.speed || 15);
            const moveStep = currentSpeed / 50000; // rough scale for lat/lng per tick
            const dLat = target.latitude - this.lat;
            const dLng = target.longitude - this.lng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);

            // Calculate heading (yaw) towards target
            if (dist > 0.00001) {
                targetYaw = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
                // Smooth yaw transition
                let diff = targetYaw - this.currentYaw;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                this.currentYaw += diff * 0.1;
            }

            // Increased threshold to 0.0002 to avoid stalling and ensure capture
            if (dist < 0.0002) {
                console.log(`🏁 UAV ${this.uavId} reached waypoint ${this.currentWpIndex + 1}`);
                this.reachedWpIndices.push(this.currentWpIndex);
                this.currentWpIndex++;
                if (this.currentWpIndex >= this.waypoints.length) {
                    console.log(`✅ UAV ${this.uavId} completed mission.`);
                    // Automatic completion status update
                    this.updateMissionStatus('completed');
                }
            } else {
                this.lat += (dLat / dist) * moveStep;
                this.lng += (dLng / dist) * moveStep;
            }

            // Altitude adjustment
            const targetAlt = this.overrideAlt !== undefined ? this.overrideAlt : (target.altitude || 50);
            const dAlt = targetAlt - this.alt;
            if (Math.abs(dAlt) > 0.5) {
                this.alt += dAlt > 0 ? 0.5 : -0.5;
            }
        } else {
            // Idle movement (small circle)
            this.lat += Math.sin(this.frameCount * 0.05) * 0.00001;
            this.lng += Math.cos(this.frameCount * 0.05) * 0.00001;

            // Apply override alt even in LOITER if set
            if (this.overrideAlt !== undefined) {
                const dAlt = this.overrideAlt - this.alt;
                if (Math.abs(dAlt) > 0.5) this.alt += dAlt > 0 ? 0.5 : -0.5;
            }
        }

        return {
            uavId: this.uavId,
            latitude: this.lat,
            longitude: this.lng,
            altitude: parseFloat(this.alt.toFixed(1)),
            battery: parseFloat(this.battery.toFixed(1)),
            airspeed: this.overrideSpeed !== undefined ? this.overrideSpeed : (flightMode === 'AUTO' ? 15 : 0),
            roll: (flightMode === 'AUTO' || this.overrideSpeed) ? 5 : 0,
            pitch: 0,
            yaw: Math.round(this.currentYaw),
            flightMode,
            signalStrength: 85,
            cpuUsage: 45,
            temperature: 52,
            reachedWaypoints: [...this.reachedWpIndices],
            missionCompleted: this.currentWpIndex >= this.waypoints.length && this.waypoints.length > 0,
            timestamp: new Date(),
        };
    }

    private updateMissionStatus(status: 'completed' | 'aborted') {
        // Find active mission for this UAV and update
        Mission.update({ status }, { where: { uavId: this.uavId, status: 'active' } })
            .catch(err => console.error('Failed to update auto-completion status', err));
    }
}
