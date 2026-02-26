/**
 * Runs Vite dev server with SIGTERM immunity.
 *
 * Intercepts process.once('SIGTERM') before Vite loads so Vite's internal
 * closeServerAndExit handler is never registered. The outer workflow loop
 * (while true; ...) handles restarts if the process exits for any other reason.
 */

// Patch process.once to intercept SIGTERM/SIGHUP registrations
const _once = process.once.bind(process);
process.once = (event, handler) => {
  if (event === 'SIGTERM' || event === 'SIGHUP') {
    console.log(`[vite-stable] intercepted process.once('${event}') - blocked`);
    return process;
  }
  return _once(event, handler);
};

// Also catch any direct SIGTERM in case something else sends it
process.on('SIGTERM', () => {
  console.log('[vite-stable] SIGTERM received and ignored');
});
process.on('SIGHUP', () => {
  console.log('[vite-stable] SIGHUP received and ignored');
});

// Catch any uncaught exceptions that might otherwise crash Vite
process.on('uncaughtException', (err) => {
  console.error('[vite-stable] uncaughtException (continuing):', err.message);
});

// Launch Vite via dynamic import (it's an ES module)
await import('../node_modules/vite/bin/vite.js');
