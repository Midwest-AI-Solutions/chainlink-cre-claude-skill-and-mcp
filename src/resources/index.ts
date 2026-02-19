import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDocResources } from "./docs.js";
import { registerTemplateResources } from "./templates.js";
import { registerSolidityResources } from "./solidity.js";

export function registerAllResources(server: McpServer): void {
  registerDocResources(server);
  registerTemplateResources(server);
  registerSolidityResources(server);
}
