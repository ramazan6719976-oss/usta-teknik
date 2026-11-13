const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3080;
const PIN = process.env.SHOP_PIN || "usta2026";
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "data", "store.json");

const empty = () => ({
  parts: [],
  jobs: [],
  customers: [],
  debts: [],
  entries: [],
  quotes: [],
  updatedAt: null,
});

function ensureData() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty(), null, 2), "utf8");
  }
}

function readStore() {
  ensureData();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return {
      parts: Array.isArray(data.parts) ? data.parts : [],
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      customers: Array.isArray(data.customers) ? data.customers : [],
      debts: Array.isArray(data.debts) ? data.debts : [],
      entries: Array.isArray(data.entries) ? data.entries : [],
      quotes: Array.isArray(data.quotes) ? data.quotes : [],
      updatedAt: data.updatedAt || null,
    };
  } catch {
    return empty();
  }
}

function writeStore(data) {
  ensureData();
  const next = {
    parts: data.parts || [],
    jobs: data.jobs || [],
    customers: data.customers || [],
    debts: data.debts || [],
    entries: data.entries || [],
    quotes: data.quotes || [],
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Shop-Pin",
  });
  res.end(payload);
}

function checkPin(req) {
  const pin = req.headers["x-shop-pin"] || "";
  return pin === PIN;
}

function mime(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    return send(res, 204, "");
  }

  if (url.pathname === "/api/health") {
    return send(res, 200, { ok: true, shop: "Usta Teknik" });
  }

  if (url.pathname === "/api/state") {
    if (!checkPin(req)) return send(res, 401, { error: "PIN hatalı" });
    if (req.method === "GET") return send(res, 200, readStore());
    if (req.method === "PUT") {
      try {
        const body = await readBody(req);
        const saved = writeStore(body);
        return send(res, 200, saved);
      } catch {
        return send(res, 400, { error: "Geçersiz veri" });
      }
    }
    return send(res, 405, { error: "Method yok" });
  }

  let filePath = path.join(PUBLIC, url.pathname === "/" ? "index.html" : url.pathname);
  filePath = path.normalize(filePath);
  if (!filePath.startsWith(PUBLIC)) return send(res, 403, "Forbidden", "text/plain");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return send(res, 404, "Not found", "text/plain");
  }
  const buf = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": mime(filePath), "Cache-Control": "no-store" });
  res.end(buf);
});

ensureData();
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Usta Teknik ortak panel: http://0.0.0.0:${PORT}`);
  console.log(`PIN: ${PIN}`);
});
