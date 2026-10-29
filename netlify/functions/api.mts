import express, { type NextFunction, type Request, type Response } from 'express';
import serverless from 'serverless-http';
import { apiRouter } from '../../src/server/routes';

const app = express();
app.use(express.json());

// Requests reach this function through the /api/* rewrite in netlify.toml.
// Mount on both prefixes so routes match whichever path form is forwarded.
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export const handler = serverless(app);
