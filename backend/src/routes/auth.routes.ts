import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import Joi from 'joi';

const router = Router();
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });

router.post('/login', validate(loginSchema), login);

export default router;
