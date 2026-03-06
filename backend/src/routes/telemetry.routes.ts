import { Router } from 'express';
import { getTelemetryHistory } from '../controllers/telemetry.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/history/:uavId', getTelemetryHistory);

export default router;
