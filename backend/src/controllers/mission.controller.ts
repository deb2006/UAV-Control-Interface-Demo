import { Request, Response } from 'express';
import { Mission } from '../models/Mission';
import { Waypoint } from '../models/Waypoint';
import logger from '../utils/logger';

export async function listMissions(_req: Request, res: Response): Promise<void> {
    const missions = await Mission.findAll({ include: [{ model: Waypoint, as: 'waypoints' }] });
    res.json(missions);
}

export async function createMission(req: Request, res: Response): Promise<void> {
    try {
        const { uavId, missionName, waypoints } = req.body;
        logger.info(`📝 Creating mission: ${missionName} for UAV ${uavId}`);

        const mission = await Mission.create({ uavId, missionName, status: 'planned' });

        const wps = await Waypoint.bulkCreate(
            waypoints.map((w: any, idx: number) => ({
                ...w,
                missionId: mission.id,
                sequenceOrder: idx + 1
            }))
        );

        logger.info(`✅ Mission created with ${wps.length} waypoints. ID: ${mission.id}`);
        res.status(201).json({ ...mission.toJSON(), waypoints: wps });
    } catch (error) {
        logger.error('❌ Error creating mission:', error);
        res.status(500).json({ error: 'Failed to create mission' });
    }
}

export async function getMission(req: Request, res: Response): Promise<void> {
    const mission = await Mission.findByPk(req.params['id'], {
        include: [{ model: Waypoint, as: 'waypoints' }],
    });
    if (!mission) { res.status(404).json({ error: 'Mission not found' }); return; }
    res.json(mission);
}

export async function abortMission(req: Request, res: Response): Promise<void> {
    const mission = await Mission.findByPk(req.params['id']);
    if (!mission) { res.status(404).json({ error: 'Mission not found' }); return; }
    await mission.update({ status: 'aborted' });
    res.json(mission);
}

export async function deleteMission(req: Request, res: Response): Promise<void> {
    try {
        const mission = await Mission.findByPk(req.params['id']);
        if (!mission) { res.status(404).json({ error: 'Mission not found' }); return; }

        // Delete mission (Cascade will handle waypoints if configured, otherwise manually)
        await Waypoint.destroy({ where: { missionId: mission.id } });
        await mission.destroy();

        logger.info(`🗑️ Mission deleted: ${mission.id}`);
        res.status(204).send();
    } catch (error) {
        logger.error('❌ Error deleting mission:', error);
        res.status(500).json({ error: 'Failed to delete mission' });
    }
}
