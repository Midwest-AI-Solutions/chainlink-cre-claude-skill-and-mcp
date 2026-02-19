import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli } from "../lib/cli-runner.js";
import { formatCliResult, formatErrorMessage } from "../lib/output-parser.js";

export function registerAuthTools(server: McpServer): void {
  server.tool(
    "cre_login",
    "Authenticate with Chainlink platform. Opens browser for OAuth login flow.",
    {},
    async () => {
      const result = await runCli(["login"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_logout",
    "Revoke current Chainlink authentication session.",
    {},
    async () => {
      const result = await runCli(["logout"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_whoami",
    "Show currently authenticated Chainlink account.",
    {},
    async () => {
      const result = await runCli(["whoami"]);
      return formatCliResult(result);
    }
  );
}
