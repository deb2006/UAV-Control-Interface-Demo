import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import uavRoutes from './routes/uav.routes';
import missionRoutes from './routes/mission.routes';
import telemetryRoutes from './routes/telemetry.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: process.env['CORS_ORIGIN'] || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/auth', authRoutes);
app.use('/uavs', uavRoutes);
app.use('/missions', missionRoutes);
app.use('/telemetry', telemetryRoutes);

// Global error handler
app.use(errorHandler);

export default app;
