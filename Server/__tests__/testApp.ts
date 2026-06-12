import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../routes';
import rateLimiterMiddleware from '../middleware/rateLimit';
import authenticateToken from '../middleware/header_auth';

export function createApp() {
  const app = express();
  app.set('trust proxy', true);
  app.use(rateLimiterMiddleware);
  app.use(bodyParser.json({ limit: '100kb' }));
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());
  app.use(authenticateToken);
  app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Success' });
  });
  app.use('/api', routes);
  return app;
}
