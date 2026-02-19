import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatText } from "../lib/output-parser.js";

const TRIGGER_TEMPLATES: Record<string, string> = {
  cron: `import { TaskTrigger } from "@aspect-build/rules_ts";

// Cron trigger - fires on a schedule
export const cronTrigger = {
  type: "cron" as const,
  config: {
    schedule: "0 * * * *", // Every hour
  },
};`,

  streams: `import type { StreamsTrigger } from "@chainlink/cre-sdk";

// Streams trigger - fires on Data Streams updates
export const streamsTrigger: StreamsTrigger = {
  type: "streams" as const,
  config: {
    feedIds: [
      "0x...", // ETH/USD feed ID
    ],
    deviationPercentage: 0.5,
    heartbeatSec: 3600,
  },
};`,

  mercury: `// Mercury trigger - fires on Mercury price feed updates
export const mercuryTrigger = {
  type: "mercury" as const,
  config: {
    feedIds: [
      "0x...", // Feed ID
    ],
  },
};`,

  "log-trigger": `// Log trigger - fires on EVM log events
export const logTrigger = {
  type: "log-trigger" as const,
  config: {
    contractAddress: "0x...",
    eventSignature: "Transfer(address,address,uint256)",
    chainId: 1,
  },
};`,

  "on-demand": `// On-demand trigger - fires via API call
export const onDemandTrigger = {
  type: "on-demand" as const,
  config: {},
};`,

  http: `// HTTP trigger - fires on incoming webhook HTTP request
export const httpTrigger = {
  type: "http" as const,
  config: {},
};`,
};

const CAPABILITY_TEMPLATES: Record<string, string> = {
  "custom-compute": `import type { CustomComputeCapability } from "@chainlink/cre-sdk";

// Custom compute capability - run arbitrary WASM logic
export const customCompute: CustomComputeCapability = {
  type: "custom-compute" as const,
  config: {
    wasmBinaryPath: "./build/workflow.wasm",
  },
};`,

  "write-evm": `// Write EVM capability - write data to EVM chains
export const writeEvm = {
  type: "write-evm" as const,
  config: {
    chainId: 1,
    contractAddress: "0x...",
    method: "updatePrice(uint256)",
    gasLimit: 200000,
  },
};`,

  "data-feeds-read": `// Data Feeds Read capability - read Chainlink price feeds
export const dataFeedsRead = {
  type: "data-feeds-read" as const,
  config: {
    feedIds: ["0x..."],
  },
};`,

  "streams-lookup": `// Streams Lookup capability - fetch Data Streams reports
export const streamsLookup = {
  type: "streams-lookup" as const,
  config: {
    feedIds: ["0x..."],
  },
};`,

  "chain-reader": `// Chain Reader capability - read on-chain state
export const chainReader = {
  type: "chain-reader" as const,
  config: {
    chainId: 1,
    contractAddress: "0x...",
    method: "balanceOf(address)",
    params: ["0x..."],
  },
};`,

  "http-client": `// HTTP Client capability - make HTTP requests with DON consensus
export const httpClient = {
  type: "http-client" as const,
  config: {
    url: "https://api.example.com/data",
    method: "GET",
    headers: { "Content-Type": "application/json" },
  },
};`,

  consensus: `// Consensus capability - aggregate results across DON nodes
export const consensus = {
  type: "consensus" as const,
  config: {
    aggregation: "median", // median | mean | mode
  },
};`,
};

export function registerCodegenTools(server: McpServer): void {
  server.tool(
    "cre_scaffold_trigger",
    "Generate TypeScript code for a CRE workflow trigger. Triggers define what starts a workflow execution.",
    {
      triggerType: z
        .enum(["cron", "streams", "mercury", "log-trigger", "on-demand", "http"])
        .describe("Type of trigger to scaffold"),
    },
    async ({ triggerType }) => {
      const code = TRIGGER_TEMPLATES[triggerType];
      if (!code) {
        return formatText(`Unknown trigger type: ${triggerType}`);
      }
      return formatText(code);
    }
  );

  server.tool(
    "cre_scaffold_capability",
    "Generate TypeScript code for a CRE workflow capability. Capabilities define actions a workflow can perform.",
    {
      capabilityType: z
        .enum(["custom-compute", "write-evm", "data-feeds-read", "streams-lookup", "chain-reader", "http-client", "consensus"])
        .describe("Type of capability to scaffold"),
    },
    async ({ capabilityType }) => {
      const code = CAPABILITY_TEMPLATES[capabilityType];
      if (!code) {
        return formatText(`Unknown capability type: ${capabilityType}`);
      }
      return formatText(code);
    }
  );

  server.tool(
    "cre_scaffold_handler",
    "Generate a complete CRE workflow handler with trigger, capabilities, and handler function. This is a ready-to-use starting point for a new workflow.",
    {
      workflowName: z.string().describe("Name for the workflow"),
      triggerType: z
        .enum(["cron", "streams", "mercury", "log-trigger", "on-demand", "http"])
        .describe("Trigger type for the workflow"),
      capabilities: z
        .array(z.enum(["custom-compute", "write-evm", "data-feeds-read", "streams-lookup", "chain-reader", "http-client", "consensus"]))
        .min(1)
        .describe("Capabilities to include in the workflow"),
    },
    async ({ workflowName, triggerType, capabilities }) => {
      const capImports = capabilities
        .map((c) => {
          const varName = c.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());
          return `  ${varName}`;
        })
        .join(",\n");

      const capConfigs = capabilities
        .map((c) => {
          const template = CAPABILITY_TEMPLATES[c];
          return template ? `\n${template}` : "";
        })
        .join("\n");

      const triggerCode = TRIGGER_TEMPLATES[triggerType] || "";

      const handler = `// ${workflowName} - CRE Workflow Handler
// Generated scaffold — customize the handler logic below.

${triggerCode}

${capConfigs}

// Workflow handler — receives trigger output + capability results
export async function handler(triggerOutput: unknown): Promise<unknown> {
  console.log("Workflow ${workflowName} triggered:", triggerOutput);

  // TODO: Implement your workflow logic here
  // 1. Process trigger data
  // 2. Use capabilities to read/write data
  // 3. Return result

  return {
    success: true,
    workflow: "${workflowName}",
    timestamp: Date.now(),
  };
}
`;
      return formatText(handler);
    }
  );
}
