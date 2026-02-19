import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAuthTools } from "./auth.js";
import { registerProjectTools } from "./project.js";
import { registerWorkflowTools } from "./workflow.js";
import { registerSecretsTools } from "./secrets.js";
import { registerCodegenTools } from "./codegen.js";
import { registerDocsTools } from "./docs.js";
import { registerAccountTools } from "./account.js";
import { registerSolidityTools } from "./solidity.js";

export function registerAllTools(server: McpServer): void {
  registerAuthTools(server);
  registerProjectTools(server);
  registerWorkflowTools(server);
  registerSecretsTools(server);
  registerCodegenTools(server);
  registerDocsTools(server);
  registerAccountTools(server);
  registerSolidityTools(server);
}
