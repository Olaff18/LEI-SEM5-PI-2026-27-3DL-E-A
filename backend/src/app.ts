import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }),
);

// OpenAPI / Swagger definition (only health endpoint)
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'Starting API skeleton documentation',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        description: 'Returns health status, application version, and UTC timestamp.',
        responses: {
          '200': {
            description: 'Server is healthy and reachable.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    version: { type: 'string', example: '1.0.0' },
                    timestamp: { type: 'string', example: '2026-09-25T12:00:00.000Z' },
                  },
                  required: ['status', 'version', 'timestamp'],
                },
              },
            },
          },
        },
      },
    },
  },
};

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Versioned API router
const apiV1Router = express.Router();

// GET /api/v1/health
apiV1Router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiV1Router);

// Global Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status,
    },
  });
});

export default app;
