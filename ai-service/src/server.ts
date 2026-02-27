import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createRouter } from './routes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Redirecting...</title>
  <script>
    const url = new URL(window.location.href);
    url.port = '';
    window.location.replace(url.href);
  </script>
</head>
<body>Redirecting to the application...</body>
</html>`);
});

app.use('/', createRouter());

const PORT = process.env.PORT || 3001;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`AI Service running on port ${PORT}`);
});
