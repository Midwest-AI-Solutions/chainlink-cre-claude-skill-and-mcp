import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatText } from "../lib/output-parser.js";

const DOCS: Record<string, string> = {
  overview: `# CRE — Chainlink Runtime Environment

The Chainlink Runtime Environment (CRE) is an orchestration layer for building decentralized workflows
that combine on-chain and off-chain logic. Workflows run on a Decentralized Oracle Network (DON).

## Core Concepts

- **Workflow**: A pipeline of triggers and capabilities compiled to WASM and executed on a DON.
- **Trigger**: The event that starts a workflow (cron, streams, log event, on-demand).
- **Capability**: An action the workflow can perform (compute, write to chain, read feeds).
- **Handler**: TypeScript function that processes trigger output and orchestrates capabilities.
- **DON**: Decentralized Oracle Network — the compute layer that runs workflows.

## Lifecycle

1. \`cre init\` — scaffold project
2. Write handler TypeScript
3. \`cre workflow custom-build\` — compile to WASM
4. \`cre workflow simulate\` — test locally
5. \`cre workflow deploy\` — push to registry
6. \`cre workflow activate\` — start on DON

## Project Structure

\`\`\`
my-project/
├── project.yaml          # Project metadata
├── workflows/
│   └── my-workflow/
│       ├── workflow.yaml # Workflow config (trigger, capabilities, secrets)
│       ├── handler.ts    # Workflow logic
│       ├── secrets.yaml  # Secret references
│       └── build/        # WASM output (gitignored)
\`\`\``,

  "sdk-reference": `# CRE TypeScript SDK Reference

## Installation
\`\`\`bash
npm install @chainlink/cre-sdk
\`\`\`

## Trigger Types

| Type | Import | Use Case |
|------|--------|----------|
| \`cron\` | CronTrigger | Time-based scheduling |
| \`streams\` | StreamsTrigger | Data Streams price updates |
| \`mercury\` | MercuryTrigger | Mercury feed updates |
| \`log-trigger\` | LogTrigger | EVM log events |
| \`on-demand\` | OnDemandTrigger | API-initiated |

## Capability Types

| Type | Import | Use Case |
|------|--------|----------|
| \`custom-compute\` | CustomComputeCapability | Arbitrary WASM logic |
| \`write-evm\` | WriteEvmCapability | Write to EVM chains |
| \`data-feeds-read\` | DataFeedsReadCapability | Read Chainlink feeds |
| \`streams-lookup\` | StreamsLookupCapability | Fetch Data Streams reports |
| \`chain-reader\` | ChainReaderCapability | Read on-chain state |

## Handler Signature
\`\`\`typescript
export async function handler(triggerOutput: TriggerOutput): Promise<CapabilityResult>
\`\`\``,

  "workflow-lifecycle": `# CRE Workflow Lifecycle

## States

\`\`\`
[init] → [built] → [simulated] → [deployed] → [active]
                                        ↕
                                    [paused]
                                        ↓
                                   [deleted]
\`\`\`

## Commands by State

| Current State | Command | Next State |
|---------------|---------|------------|
| (none) | \`cre init\` | init |
| init | \`cre workflow custom-build\` | built |
| built | \`cre workflow simulate\` | simulated |
| built/simulated | \`cre workflow deploy\` | deployed |
| deployed | \`cre workflow activate\` | active |
| active | \`cre workflow pause\` | paused |
| paused | \`cre workflow activate\` | active |
| deployed/paused | \`cre workflow delete\` | deleted |`,

  triggers: `# CRE Trigger Types

## Cron Trigger
Schedule-based execution using cron syntax.
- Config: \`schedule\` (cron expression)
- Example: \`"0 * * * *"\` (every hour)

## Streams Trigger
Fires when Data Streams prices deviate beyond threshold.
- Config: \`feedIds\`, \`deviationPercentage\`, \`heartbeatSec\`
- Use case: Price-reactive automations

## Mercury Trigger
Fires on Mercury price feed updates.
- Config: \`feedIds\`
- Use case: Low-latency price reactions

## Log Trigger
Fires on EVM contract log events.
- Config: \`contractAddress\`, \`eventSignature\`, \`chainId\`
- Use case: Reacting to on-chain events

## On-Demand Trigger
Triggered via API call.
- Config: (none)
- Use case: User-initiated or external-system-initiated workflows`,

  capabilities: `# CRE Capability Types

## Custom Compute
Run arbitrary WASM logic in the DON.
- Config: \`wasmBinaryPath\`
- Use case: Complex transformations, aggregations, business logic

## Write EVM
Write data to EVM-compatible blockchains.
- Config: \`chainId\`, \`contractAddress\`, \`method\`, \`gasLimit\`
- Use case: Update on-chain state, call contracts

## Data Feeds Read
Read current Chainlink price feed data.
- Config: \`feedIds\`
- Use case: Get latest prices for decision logic

## Streams Lookup
Fetch detailed Data Streams reports.
- Config: \`feedIds\`
- Use case: High-fidelity price data with proofs

## Chain Reader
Read arbitrary on-chain state.
- Config: \`chainId\`, \`contractAddress\`, \`method\`, \`params\`
- Use case: Check balances, read contract storage`,
};

export function registerDocsTools(server: McpServer): void {
  server.tool(
    "cre_get_docs",
    "Get CRE documentation for a specific topic. Available topics: overview, sdk-reference, workflow-lifecycle, triggers, capabilities.",
    {
      topic: z
        .enum(["overview", "sdk-reference", "workflow-lifecycle", "triggers", "capabilities"])
        .describe("Documentation topic to retrieve"),
    },
    async ({ topic }) => {
      const doc = DOCS[topic];
      if (!doc) {
        return formatText(`Unknown topic: ${topic}. Available: ${Object.keys(DOCS).join(", ")}`);
      }
      return formatText(doc);
    }
  );

  server.tool(
    "cre_list_capabilities",
    "List all available CRE capability types with descriptions.",
    {},
    async () => {
      return formatText(DOCS["capabilities"]!);
    }
  );

  server.tool(
    "cre_list_triggers",
    "List all available CRE trigger types with descriptions.",
    {},
    async () => {
      return formatText(DOCS["triggers"]!);
    }
  );
}
