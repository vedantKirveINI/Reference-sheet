/**
 * Stable Vite proxy for Replit.
 *
 * Keeps port 5000 permanently bound (the Replit webview port) and forwards
 * all HTTP + WebSocket traffic to Vite on port 5001. Ignores SIGTERM so the
 * port never drops during Replit checkpoint cycles. Restarts Vite automatically
 * when it exits.
 */

const http = require("http");
const net = require("net");
const { spawn } = require("child_process");
const path = require("path");

const PROXY_PORT = 5000;
const VITE_PORT = 5001;
const ROOT = path.resolve(__dirname, "..");

process.on("SIGTERM", () => {});
process.on("SIGHUP", () => {});
process.on("uncaughtException", (err) => {
  console.error("[proxy] uncaughtException:", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[proxy] unhandledRejection:", reason);
});

let viteReady = false;
let pendingCallbacks = [];

function onViteReady(fn) {
  if (viteReady) return fn();
  pendingCallbacks.push(fn);
}

function setViteReady(ready) {
  viteReady = ready;
  if (ready) {
    const cbs = pendingCallbacks.splice(0);
    for (const fn of cbs) {
      try { fn(); } catch (e) { console.error("[proxy] pending cb error:", e.message); }
    }
  }
}

function startVite() {
  setViteReady(false);
  const child = spawn(
    process.execPath,
    [path.join(ROOT, "node_modules/vite/bin/vite.js"), "--port", String(VITE_PORT), "--host", "127.0.0.1"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
  );

  child.stdout.on("data", (d) => {
    const text = d.toString();
    process.stdout.write(text);
    if (!viteReady && (text.includes("Local:") || text.includes("ready in"))) {
      setViteReady(true);
    }
  });
  child.stderr.on("data", (d) => process.stderr.write(d));
  child.on("error", (err) => {
    console.error("[proxy] Vite spawn error:", err.message);
    setTimeout(startVite, 2000);
  });
  child.on("exit", (code) => {
    setViteReady(false);
    console.log(`[proxy] Vite exited (${code ?? "signal"}), restarting in 1s...`);
    setTimeout(startVite, 1000);
  });
}

function proxyHttpRequest(req, res) {
  onViteReady(() => {
    const options = {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${VITE_PORT}` },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.on("error", () => { try { res.destroy(); } catch (_) {} });
      res.on("error", () => { try { proxyRes.destroy(); } catch (_) {} });
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      if (!res.headersSent) {
        try { res.writeHead(502).end("Vite unavailable"); } catch (_) {}
      }
    });

    req.on("error", () => { try { proxyReq.destroy(); } catch (_) {} });
    req.pipe(proxyReq, { end: true });
  });
}

function proxyUpgrade(req, clientSocket, head) {
  onViteReady(() => {
    const serverSocket = net.connect(VITE_PORT, "127.0.0.1", () => {
      const headerLines = Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n");
      serverSocket.write(`${req.method} ${req.url} HTTP/1.1\r\n${headerLines}\r\n\r\n`);
      if (head && head.length) serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });
    serverSocket.on("error", () => { try { clientSocket.destroy(); } catch (_) {} });
    clientSocket.on("error", () => { try { serverSocket.destroy(); } catch (_) {} });
    serverSocket.on("end", () => { try { clientSocket.end(); } catch (_) {} });
    clientSocket.on("end", () => { try { serverSocket.end(); } catch (_) {} });
  });
}

const server = http.createServer(proxyHttpRequest);
server.on("upgrade", proxyUpgrade);
server.on("error", (err) => console.error("[proxy] server error:", err.message));
server.on("clientError", (err, socket) => {
  try { socket.destroy(); } catch (_) {}
});

server.listen(PROXY_PORT, "0.0.0.0", () => {
  console.log(`[proxy] Listening on :${PROXY_PORT} → Vite :${VITE_PORT}`);
  startVite();
});
