import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { TelemetrySimulator } from '../services/telemetry.simulator';
import { TelemetryLog } from '../models/TelemetryLog';
import { UAV } from '../models/UAV';
import { Mission } from '../models/Mission';
import { Waypoint } from '../models/Waypoint';
import logger from '../utils/logger';

let io: Server;
const simulators = new Map<number, TelemetrySimulator>();
const EMIT_INTERVAL_MS = 200;

export function initSocket(server: HttpServer): void {
    io = new Server(server, {
        cors: { origin: process.env['CORS_ORIGIN'] || '*', credentials: true },
        transports: ['websocket', 'polling'],
    });

    io.on('connection', (socket: Socket) => {
        logger.info(`🔌 Client connected: ${socket.id}`);

        socket.on('subscribe_uav', async (uavId: number) => {
            logger.info(`📡 Client ${socket.id} subscribing to UAV ${uavId}`);
            const room = `uav_${uavId}`;
            await socket.join(room);

            // Start simulator if not already running
            if (!simulators.has(uavId)) {
                const uav = await UAV.findByPk(uavId);
                if (!uav) { socket.emit('error', { message: 'UAV not found' }); return; }

                const sim = new TelemetrySimulator(uavId);
                simulators.set(uavId, sim);

                const intervalId = setInterval(async () => {
                    const telemetry = sim.next();
                    io.to(room).emit('telemetry', telemetry);

                    // Check for mission completion to notify frontend to refresh lists
                    if ((telemetry as any).missionCompleted) {
                        io.to(room).emit('mission_completed', { uavId });
                    }

                    // Persist every 5th frame to avoid DB flooding
                    if (sim.frameCount % 5 === 0) {
                        try {
                            await TelemetryLog.create(telemetry);
                            await UAV.update({ lastSeen: new Date(), status: 'active' }, { where: { id: uavId } });
                        } catch (e) {
                            logger.warn('Telemetry persist error', e);
                        }
                    }
                }, EMIT_INTERVAL_MS);

                sim.setIntervalId(intervalId);
                logger.info(`▶️  Started simulator for UAV ${uavId}`);
            } else {
                logger.info(`Simulator already running for UAV ${uavId}`);
            }
        });

        socket.on('unsubscribe_uav', (uavId: number) => {
            socket.leave(`uav_${uavId}`);
            logger.info(`📴 Client ${socket.id} unsubscribed from UAV ${uavId}`);
        });

        socket.on('start_mission', async (data: { uavId: number, missionId: number }) => {
            const { uavId, missionId } = data;
            logger.info(`🚀 Starting mission ${missionId} for UAV ${uavId}`);

            const mission = await Mission.findByPk(missionId, {
                include: [{ model: Waypoint, as: 'waypoints' }]
            });

            if (!mission) {
                logger.warn(`Mission ${missionId} not found`);
                return;
            }

            const sim = simulators.get(uavId);
            if (sim) {
                // @ts-ignore - setWaypoints exists but might not be in the type if not updated everywhere
                sim.setWaypoints((mission as any).waypoints);
                await mission.update({ status: 'active' });
                io.to(`uav_${uavId}`).emit('mission_started', mission);
            } else {
                logger.warn(`No simulator running for UAV ${uavId}`);
            }
        });

        socket.on('set_home', async (data: { uavId: number, latitude: number, longitude: number }) => {
            const { uavId, latitude, longitude } = data;
            logger.info(`🏠 Setting Home for UAV ${uavId}: ${latitude}, ${longitude}`);

            const sim = simulators.get(uavId);
            if (sim) {
                // @ts-ignore
                sim.setHome(latitude, longitude);
                io.to(`uav_${uavId}`).emit('home_set', { latitude, longitude });
            }
        });

        // Update parameters (Speed/Alt)
        socket.on('update_uav_params', ({ uavId, params }) => {
            const sim = simulators.get(uavId);
            if (sim) {
                logger.info(`🎚️ Manual parameter update for UAV ${uavId}:`, params);
                sim.setParams(params);
            }
        });

        // Perform action (Fire/Drop)
        socket.on('perform_action', ({ uavId, action }) => {
            const sim = simulators.get(uavId);
            if (sim) {
                logger.info(`🎯 Action triggered for UAV ${uavId}: ${action}`);
                sim.performAction(action);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    logger.info('✅ Socket.IO initialized');
}

export { io };
