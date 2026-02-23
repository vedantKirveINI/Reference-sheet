import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createRouter } from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/', createRouter());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});
