# CRE MCP Server

MCP server for the [Chainlink Runtime Environment (CRE)](https://docs.chain.link/chainlink-automation/overview) — wraps the CRE CLI and SDK as 30 tools and 10 resources over the [Model Context Protocol](https://modelcontextprotocol.io/).

Build, simulate, deploy, and manage CRE workflows from any MCP client (Claude Code, Claude Desktop, Cursor, etc.).

## Features

- **30 MCP tools** — full CRE lifecycle: auth, project scaffolding, workflow management, secrets, code generation, account keys, and Solidity contract scaffolding
- **10 MCP resources** — architecture docs, SDK reference, config schemas, contract templates, forwarder addresses
- **Solidity support** — scaffold `IReceiver` contracts, typed consumer contracts, and CCIP receivers
- **Streamable HTTP transport** — stateful sessions via Express on port 3200

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [CRE CLI](https://github.com/smartcontractkit/cre-cli): `curl -sSfL https://raw.githubusercontent.com/smartcontractkit/cre-cli/main/install/install.sh | bash`
- [Bun](https://bun.sh/) (required by CRE CLI for WASM compilation): `brew install oven-sh/bun/bun`

## Quick Start

```bash
git clone https://github.com/Midwest-AI-Solutions/cremcp.git
cd cremcp
npm install
npm run dev
```

The server starts at `http://localhost:3200` with:
- MCP endpoint: `http://localhost:3200/mcp`
- Health check: `http://localhost:3200/health`

## MCP Client Configuration

### Claude Code (`~/.claude.json`)

```json
{
  "mcpServers": {
    "cre": {
      "type": "http",
      "url": "http://localhost:3200/mcp"
    }
  }
}
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "cre": {
      "type": "http",
      "url": "http://localhost:3200/mcp"
    }
  }
}
```

## Tools

| Category | Tools | Description |
|----------|-------|-------------|
| **Auth** | `cre_login`, `cre_logout`, `cre_whoami` | Chainlink platform authentication |
| **Project** | `cre_init`, `cre_build`, `cre_version`, `cre_update`, `cre_generate_bindings` | Project scaffolding and build |
| **Workflow** | `cre_workflow_simulate`, `cre_workflow_deploy`, `cre_workflow_activate`, `cre_workflow_pause`, `cre_workflow_delete` | Full workflow lifecycle |
| **Secrets** | `cre_secrets_create`, `cre_secrets_update`, `cre_secrets_delete`, `cre_secrets_list`, `cre_secrets_execute` | DON-encrypted secrets management |
| **Codegen** | `cre_scaffold_trigger`, `cre_scaffold_capability`, `cre_scaffold_handler` | TypeScript workflow code generation |
| **Docs** | `cre_get_docs`, `cre_list_capabilities`, `cre_list_triggers` | Documentation and reference |
| **Account** | `cre_account_link_key`, `cre_account_list_key`, `cre_account_unlink_key` | Wallet key management |
| **Solidity** | `cre_scaffold_receiver`, `cre_scaffold_consumer`, `cre_scaffold_ccip_receiver` | On-chain contract scaffolding |

## Resources

| URI | Description |
|-----|-------------|
| `cre://docs/overview` | CRE architecture overview |
| `cre://docs/sdk-reference` | TypeScript SDK quick reference |
| `cre://docs/forwarder-addresses` | KeystoneForwarder addresses by chain |
| `cre://docs/solidity-integration` | End-to-end on-chain integration guide |
| `cre://contracts/ireceiver` | IReceiver interface specification |
| `cre://contracts/consumer-template` | Annotated consumer contract template |
| `cre://config/workflow-yaml` | Workflow YAML schema |
| `cre://config/secrets-yaml` | Secrets YAML schema |
| `cre://config/project-yaml` | Project YAML schema |
| `cre://templates/workflow-ts` | Minimal workflow TypeScript template |

## Supported Trigger Types

| Type | Use Case |
|------|----------|
| `cron` | Time-based scheduling |
| `streams` | Data Streams price updates |
| `mercury` | Mercury feed updates |
| `log-trigger` | EVM log events |
| `on-demand` | API-initiated |
| `http` | Incoming webhook |

## Supported Capability Types

| Type | Use Case |
|------|----------|
| `custom-compute` | Arbitrary WASM logic |
| `write-evm` | Write to EVM chains |
| `data-feeds-read` | Read Chainlink price feeds |
| `streams-lookup` | Fetch Data Streams reports |
| `chain-reader` | Read on-chain state |
| `http-client` | HTTP requests with DON consensus |
| `consensus` | Aggregate results across DON nodes |

## Architecture

```
src/
├── index.ts              # Express server + Streamable HTTP transport
├── server.ts             # McpServer instance + tool/resource registration
├── lib/
│   ├── cli-check.ts      # CRE CLI availability detection
│   ├── cli-runner.ts     # child_process.spawn wrapper
│   └── output-parser.ts  # Tool response formatting
├── tools/
│   ├── index.ts          # Tool module registration
│   ├── auth.ts           # Login, logout, whoami
│   ├── project.ts        # Init, build, version, update, generate-bindings
│   ├── workflow.ts       # Simulate, deploy, activate, pause, delete
│   ├── secrets.ts        # CRUD + execute for DON secrets
│   ├── codegen.ts        # Trigger, capability, handler scaffolding
│   ├── docs.ts           # Documentation retrieval
│   ├── account.ts        # Wallet key management
│   └── solidity.ts       # Solidity contract scaffolding
└── resources/
    ├── index.ts          # Resource module registration
    ├── docs.ts           # Overview + SDK reference
    ├── templates.ts      # Config schemas + workflow template
    └── solidity.ts       # IReceiver, consumer, forwarder addresses, integration guide
```

## Development

```bash
npm run dev        # Start with hot reload (tsx --watch)
npm run build      # Compile TypeScript
npm start          # Run compiled JS
npm run typecheck  # Type check without emitting
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3200` | Server port |
| `CRE_CLI_PATH` | `~/.cre/bin/cre` | Path to CRE CLI binary |

## License

MIT
