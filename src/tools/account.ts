import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli } from "../lib/cli-runner.js";
import { formatCliResult } from "../lib/output-parser.js";

export function registerAccountTools(server: McpServer): void {
  server.tool(
    "cre_account_link_key",
    "Link a wallet key to the authenticated CRE account. Required before deploying workflows that interact with on-chain contracts.",
    {
      ownerLabel: z.string().describe("Label for the key owner (used for identification)"),
    },
    async ({ ownerLabel }) => {
      const result = await runCli(["account", "link-key", "--owner-label", ownerLabel, "--yes"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_account_list_key",
    "List all wallet keys linked to the authenticated CRE account.",
    {},
    async () => {
      const result = await runCli(["account", "list-key"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_account_unlink_key",
    "Unlink a wallet key from the authenticated CRE account. This removes the key association but does not delete the key itself.",
    {},
    async () => {
      const result = await runCli(["account", "unlink-key", "--yes"]);
      return formatCliResult(result);
    }
  );
}
