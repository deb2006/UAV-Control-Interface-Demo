import { Router } from 'express';
import { createMission, getMission, abortMission, deleteMission, listMissions } from '../controllers/mission.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import Joi from 'joi';

const router = Router();
router.use(authenticate);

const waypointSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    altitude: Joi.number().default(50),
    speed: Joi.number().default(15),
    actionType: Joi.string().valid('hover', 'capture', 'rtl', 'land', 'waypoint').default('waypoint'),
    sequenceOrder: Joi.number().required(),
});

const createMissionSchema = Joi.object({
    uavId: Joi.number().required(),
    missionName: Joi.string().required(),
    waypoints: Joi.array().items(waypointSchema).min(1).required(),
});

router.get('/', listMissions);
router.post('/', validate(createMissionSchema), createMission);
router.get('/:id', getMission);
router.put('/:id/abort', abortMission);
router.delete('/:id', deleteMission);

export default router;
