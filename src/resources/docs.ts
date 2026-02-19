import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDocResources(server: McpServer): void {
  server.resource(
    "cre-overview",
    "cre://docs/overview",
    { description: "CRE architecture overview — core concepts, lifecycle, project structure", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://docs/overview",
          mimeType: "text/markdown",
          text: `# CRE — Chainlink Runtime Environment

The Chainlink Runtime Environment (CRE) is an orchestration layer for building decentralized workflows that combine on-chain and off-chain logic. Workflows run on a Decentralized Oracle Network (DON).

## Core Concepts

- **Workflow**: A pipeline of triggers and capabilities compiled to WASM and executed on a DON.
- **Trigger**: The event that starts a workflow (cron, streams, log event, on-demand).
- **Capability**: An action the workflow can perform (compute, write to chain, read feeds).
- **Handler**: TypeScript function that processes trigger output and orchestrates capabilities.
- **DON (Decentralized Oracle Network)**: The compute layer that runs workflows across multiple nodes.

## Architecture

\`\`\`
[Trigger] → [Handler (WASM)] → [Capability 1] → [Capability 2] → [Target]
\`\`\`

The handler receives trigger output, processes it with custom logic, and invokes capabilities to read/write data. The entire pipeline runs trustlessly on the DON.

## Lifecycle

1. \`cre init\` — scaffold a new project
2. Write your TypeScript handler
3. \`cre workflow custom-build\` — compile handler to WASM via Bun
4. \`cre workflow simulate\` — test locally with mock inputs
5. \`cre workflow deploy\` — push compiled workflow to the registry
6. \`cre workflow activate\` — start execution on the DON
7. \`cre workflow pause\` / \`cre workflow delete\` — manage lifecycle

## Project Structure

\`\`\`
my-project/
├── project.yaml           # Project metadata, DON config
├── workflows/
│   └── my-workflow/
│       ├── workflow.yaml  # Trigger, capabilities, secrets refs
│       ├── handler.ts     # Workflow logic (compiled to WASM)
│       ├── secrets.yaml   # DON-encrypted secret definitions
│       └── build/         # WASM output (gitignored)
└── node_modules/          # SDK dependencies
\`\`\``,
        },
      ],
    })
  );

  server.resource(
    "cre-sdk-reference",
    "cre://docs/sdk-reference",
    { description: "CRE TypeScript SDK quick reference — imports, types, patterns", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://docs/sdk-reference",
          mimeType: "text/markdown",
          text: `# CRE TypeScript SDK Reference

## Installation

\`\`\`bash
npm install @chainlink/cre-sdk
\`\`\`

## Trigger Types

| Type | Config Fields | Use Case |
|------|---------------|----------|
| \`cron\` | schedule | Time-based scheduling |
| \`streams\` | feedIds, deviationPercentage, heartbeatSec | Data Streams price updates |
| \`mercury\` | feedIds | Mercury feed updates |
| \`log-trigger\` | contractAddress, eventSignature, chainId | EVM log events |
| \`on-demand\` | (none) | API-initiated |
| \`http\` | (none) | Incoming webhook HTTP request |

## Capability Types

| Type | Config Fields | Use Case |
|------|---------------|----------|
| \`custom-compute\` | wasmBinaryPath | Arbitrary WASM logic |
| \`write-evm\` | chainId, contractAddress, method, gasLimit | Write to EVM chains |
| \`data-feeds-read\` | feedIds | Read Chainlink feeds |
| \`streams-lookup\` | feedIds | Fetch Data Streams reports |
| \`chain-reader\` | chainId, contractAddress, method, params | Read on-chain state |
| \`http-client\` | url, method, headers | HTTP requests with DON consensus |
| \`consensus\` | aggregation | Aggregate results across DON nodes |

## Handler Pattern

\`\`\`typescript
import type { TriggerOutput, CapabilityResult } from "@chainlink/cre-sdk";

export async function handler(input: TriggerOutput): Promise<CapabilityResult> {
  // 1. Extract data from trigger
  const data = input.payload;

  // 2. Process with custom logic
  const result = transform(data);

  // 3. Return capability instructions
  return { action: "write-evm", params: result };
}
\`\`\``,
        },
      ],
    })
  );
}
