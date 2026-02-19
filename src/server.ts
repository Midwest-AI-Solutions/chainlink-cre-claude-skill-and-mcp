import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "cre-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  registerAllTools(server);
  registerAllResources(server);

  return server;
}
