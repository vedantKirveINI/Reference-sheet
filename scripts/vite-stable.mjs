/**
 * Runs Vite dev server with SIGTERM immunity.
 *
 * Patches process.once('SIGTERM') before Vite loads so Vite's internal
 * closeServerAndExit handler is never registered. Survives Replit checkpoint
 * SIGKILL cycles when launched with `setsid` in the workflow command.
 */
import { createRequire } from 'module';
import http from 'http';

const _require = createRequire(import.meta.url);

// Intercept SIGTERM/SIGHUP registrations before Vite loads
const _once = process.once.bind(process);
process.once = (event, handler) => {
  if (event === 'SIGTERM' || event === 'SIGHUP') return process;
  return _once(event, handler);
};
process.on('SIGTERM', () => {});
process.on('SIGHUP', () => {});
process.on('uncaughtException', (err) => {
  if (!err.message?.includes('EADDRINUSE')) {
    console.error('[vite-stable] uncaughtException:', err.message);
  }
});

// Launch Vite
await import('../node_modules/vite/bin/vite.js');

// Warm up Vite's on-demand compilation cache so the first browser load is fast
const args = process.argv.slice(2);
const portArg = args[args.indexOf('--port') + 1];
const port = portArg ? parseInt(portArg) : 5000;

setTimeout(() => {
  for (const path of ['/@vite/client', '/src/main.tsx']) {
    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      res.resume();
    }).on('error', () => {});
  }
}, 1500);
