# CRE MCP Server

MCP server for Chainlink Runtime Environment (CRE) — wraps CRE CLI and SDK.

## Stack
- TypeScript + Express + Streamable HTTP transport
- Port 3200, endpoint `/mcp`, health at `/health`
- 22 MCP tools, 6 MCP resources

## Development
```bash
npm run dev    # tsx --watch
npm run build  # tsc
npm start      # production
```

## Architecture
- `src/lib/` — CLI runner, availability check, output parser
- `src/tools/` — Tool modules (auth, project, workflow, secrets, codegen, docs)
- `src/resources/` — Static resources (docs, templates, config schemas)
- `src/server.ts` — McpServer instance + tool/resource registration
- `src/index.ts` — Express HTTP server + session management
