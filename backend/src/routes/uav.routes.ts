import { Router } from 'express';
import { getUAVs, getUAVById } from '../controllers/uav.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', getUAVs);
router.get('/:id', getUAVById);

export default router;
