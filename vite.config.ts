import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

function mockDbPlugin() {
  const DB_PATH = path.resolve(__dirname, "mock-db.json");
  const ensureDb = () => {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ structures: {} }, null, 2));
    }
  };
  const readDb = () => {
    ensureDb();
    try {
      const txt = fs.readFileSync(DB_PATH, "utf-8");
      const data = JSON.parse(txt);
      // ensure shape
      if (!data.structures) data.structures = {};
      if (!data.scripts) data.scripts = [];
      return data;
    } catch {
      return { structures: {}, scripts: [] };
    }
  };
  const writeDb = (data: any) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  };
  return {
    name: "mock-db",
    apply: "serve" as const,
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (!req.url?.startsWith("/api/mock-db")) return next();
        // CORS for dev tools
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          return res.end();
        }
        const url = new URL(req.url, "http://localhost");
        const db = readDb();

        // Structure endpoints
        if (req.method === "GET" && url.pathname === "/api/mock-db/structure") {
          const scriptId = url.searchParams.get("scriptId") || "";
          const version = url.searchParams.get("version") || "";
          const key = `${scriptId}:${version}`;
          const sections = db.structures?.[key] ?? [];
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ sections }));
          return;
        }
        if (req.method === "PUT" && url.pathname === "/api/mock-db/structure") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { scriptId, version, sections } = JSON.parse(body || "{}");
              const key = `${scriptId}:${version}`;
              db.structures = db.structures || {};
              db.structures[key] = sections ?? [];
              writeDb(db);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false }));
            }
          });
          return;
        }

        // Scripts listing and CRUD
        if (req.method === "GET" && url.pathname === "/api/mock-db/scripts") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ scripts: db.scripts ?? [] }));
          return;
        }
        if (
          req.method === "GET" &&
          url.pathname?.startsWith("/api/mock-db/scripts/")
        ) {
          const id = url.pathname.split("/").pop() || "";
          const found = (db.scripts ?? []).find((s: any) => s.id === id);
          res.setHeader("Content-Type", "application/json");
          if (found) res.end(JSON.stringify(found));
          else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "not found" }));
          }
          return;
        }
        if (req.method === "POST" && url.pathname === "/api/mock-db/scripts") {
          let body = "";
          req.on("data", (chunk: any) => (body += chunk));
          req.on("end", () => {
            try {
              const { companyId, type, description } = JSON.parse(body || "{}");
              if (!companyId || !type) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({ ok: false, error: "missing fields" })
                );
              }
              const id = `custom_${Date.now()}`;
              const nowIso = new Date().toISOString();
              const script = {
                id,
                companyId,
                companyName: undefined,
                type,
                description: description || "",
                activeVersion: "v1.0",
                status: "Ativo",
                lastModified: nowIso,
                versions: [
                  {
                    version: "v1.0",
                    state: "Ativa",
                    date: nowIso,
                    notes: "Criado no mock",
                  },
                ],
              };
              db.scripts = db.scripts || [];
              db.scripts.push(script);
              writeDb(db);
              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify(script));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false }));
            }
          });
          return;
        }
        if (
          req.method === "DELETE" &&
          url.pathname?.startsWith("/api/mock-db/scripts/")
        ) {
          const id = url.pathname.split("/").pop() || "";
          const before = (db.scripts ?? []).length;
          db.scripts = (db.scripts ?? []).filter((s: any) => s.id !== id);
          // Remove all structures for this script id
          const structures = db.structures || {};
          for (const key of Object.keys(structures)) {
            if (key.startsWith(`${id}:`)) delete structures[key];
          }
          db.structures = structures;
          writeDb(db);
          const removed = before !== (db.scripts ?? []).length;
          res.statusCode = removed ? 200 : 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: removed }));
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && mockDbPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
