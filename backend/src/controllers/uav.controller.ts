import { Request, Response } from 'express';
import { UAV } from '../models/UAV';

export async function getUAVs(_req: Request, res: Response): Promise<void> {
    const uavs = await UAV.findAll();
    res.json(uavs);
}

export async function getUAVById(req: Request, res: Response): Promise<void> {
    const uav = await UAV.findByPk(req.params['id']);
    if (!uav) { res.status(404).json({ error: 'UAV not found' }); return; }
    res.json(uav);
}
