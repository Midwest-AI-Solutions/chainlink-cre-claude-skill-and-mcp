import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTemplateResources(server: McpServer): void {
  server.resource(
    "workflow-yaml-schema",
    "cre://config/workflow-yaml",
    { description: "Annotated workflow.yaml schema with all configuration options", mimeType: "text/yaml" },
    async () => ({
      contents: [
        {
          uri: "cre://config/workflow-yaml",
          mimeType: "text/yaml",
          text: `# workflow.yaml — CRE Workflow Configuration
# This file defines the trigger, capabilities, and metadata for a workflow.

name: my-workflow                    # Unique workflow identifier
description: "My CRE workflow"      # Human-readable description

# Trigger — what starts the workflow
trigger:
  type: cron                         # cron | streams | mercury | log-trigger | on-demand
  config:
    schedule: "0 * * * *"            # Cron expression (cron trigger only)
    # feedIds: ["0x..."]             # Feed IDs (streams/mercury triggers)
    # contractAddress: "0x..."       # Contract address (log-trigger)
    # eventSignature: "Event(...)"   # Event signature (log-trigger)
    # chainId: 1                     # Chain ID (log-trigger)

# Capabilities — what the workflow can do
capabilities:
  - type: custom-compute             # custom-compute | write-evm | data-feeds-read | streams-lookup | chain-reader
    config:
      wasmBinaryPath: ./build/workflow.wasm

# Secrets — DON-encrypted secrets referenced by the handler
secrets:
  ref: ./secrets.yaml                # Path to secrets definition file

# Build configuration
build:
  handler: ./handler.ts              # Entry point for WASM compilation
  output: ./build/workflow.wasm      # Output path for compiled WASM
`,
        },
      ],
    })
  );

  server.resource(
    "secrets-yaml-schema",
    "cre://config/secrets-yaml",
    { description: "Annotated secrets.yaml schema for DON-encrypted secrets", mimeType: "text/yaml" },
    async () => ({
      contents: [
        {
          uri: "cre://config/secrets-yaml",
          mimeType: "text/yaml",
          text: `# secrets.yaml — CRE Secrets Configuration
# Secrets are encrypted and stored on the DON. Only the DON nodes can decrypt them.
# NEVER commit actual secret values to version control.

# Each secret is a key-value pair
secrets:
  API_KEY: "your-api-key-here"       # Replace with actual value before \`cre secrets create\`
  PRIVATE_KEY: "0x..."               # EVM private key for signing transactions
  WEBHOOK_URL: "https://..."         # External service webhook URL

# Usage in handler:
#   The handler receives secrets via the runtime context.
#   Access them as: context.secrets.get("API_KEY")
`,
        },
      ],
    })
  );

  server.resource(
    "project-yaml-schema",
    "cre://config/project-yaml",
    { description: "Annotated project.yaml schema for CRE project metadata", mimeType: "text/yaml" },
    async () => ({
      contents: [
        {
          uri: "cre://config/project-yaml",
          mimeType: "text/yaml",
          text: `# project.yaml — CRE Project Configuration
# Top-level project metadata and DON configuration.

name: my-project                     # Project name
version: "1.0.0"                     # Semantic version

# DON (Decentralized Oracle Network) configuration
don:
  network: mainnet                   # mainnet | testnet
  nodeCount: 3                       # Number of DON nodes

# Workflows included in this project
workflows:
  - path: ./workflows/my-workflow    # Relative path to workflow directory
`,
        },
      ],
    })
  );

  server.resource(
    "workflow-template",
    "cre://templates/workflow-ts",
    { description: "Minimal working CRE workflow TypeScript template", mimeType: "text/typescript" },
    async () => ({
      contents: [
        {
          uri: "cre://templates/workflow-ts",
          mimeType: "text/typescript",
          text: `// Minimal CRE Workflow Handler
// This template provides a working starting point for a new workflow.

// Trigger configuration
export const trigger = {
  type: "cron" as const,
  config: {
    schedule: "*/5 * * * *", // Every 5 minutes
  },
};

// Capability configuration
export const capabilities = [
  {
    type: "custom-compute" as const,
    config: {
      wasmBinaryPath: "./build/workflow.wasm",
    },
  },
];

// Handler — your workflow logic
export async function handler(triggerOutput: unknown): Promise<unknown> {
  // triggerOutput contains the data from your trigger
  console.log("Workflow triggered:", JSON.stringify(triggerOutput));

  // Process the trigger data
  const result = {
    processed: true,
    timestamp: Date.now(),
    input: triggerOutput,
  };

  // Return the result — this gets passed to capabilities
  return result;
}
`,
        },
      ],
    })
  );
}
