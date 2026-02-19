import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";
import { isCreCliAvailable } from "./lib/cli-check.js";

const PORT = parseInt(process.env.PORT || "3200", 10);

const app = express();
app.use(cors());
app.use(express.json());

// Session management
const sessions = new Map<string, StreamableHTTPServerTransport>();

// Health endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "cre-mcp-server",
    version: "1.0.0",
    cliAvailable: isCreCliAvailable(),
    activeSessions: sessions.size,
  });
});

// MCP endpoint — handles POST (messages), GET (SSE stream), DELETE (session close)
app.all("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (req.method === "POST" && !sessionId) {
    // New session — create transport + server
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, transport);
      },
    });

    transport.onclose = () => {
      const id = [...sessions.entries()].find(([, t]) => t === transport)?.[0];
      if (id) sessions.delete(id);
    };

    const server = createServer();
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // Existing session
  if (sessionId) {
    const transport = sessions.get(sessionId);
    if (!transport) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // GET/DELETE without session ID
  if (req.method === "GET") {
    res.status(400).json({ error: "Missing mcp-session-id header for SSE stream" });
  } else if (req.method === "DELETE") {
    res.status(400).json({ error: "Missing mcp-session-id header for session close" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
});

app.listen(PORT, () => {
  console.log(`CRE MCP Server running on http://localhost:${PORT}`);
  console.log(`  MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  CRE CLI: ${isCreCliAvailable() ? "available" : "not installed"}`);
});
