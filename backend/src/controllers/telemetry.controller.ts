import { Request, Response } from 'express';
import { TelemetryLog } from '../models/TelemetryLog';
import { Op } from 'sequelize';

export async function getTelemetryHistory(req: Request, res: Response): Promise<void> {
    const { uavId } = req.params;
    const limit = parseInt(req.query['limit'] as string || '200', 10);

    const logs = await TelemetryLog.findAll({
        where: {
            uavId: parseInt(uavId, 10),
            timestamp: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) }, // last 1h
        },
        order: [['timestamp', 'ASC']],
        limit,
    });
    res.json(logs);
}
