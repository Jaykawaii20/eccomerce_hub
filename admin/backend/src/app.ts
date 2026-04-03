import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware';
import { apiRateLimit } from './middlewares/rate-limit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { sendError } from './utils/response';
import { logger } from './utils/logger';
import apiRoutes from './routes/index';

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.disable('x-powered-by');

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  })
);

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(correlationIdMiddleware);
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.path === `/api/${env.API_VERSION}/health`,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use(apiRateLimit);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, apiRoutes);

// 404
app.use((_req, res) => {
  sendError(res, { code: 'NOT_FOUND', message: 'Route not found.', status: 404 });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
