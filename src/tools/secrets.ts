import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli } from "../lib/cli-runner.js";
import { formatCliResult } from "../lib/output-parser.js";

export function registerSecretsTools(server: McpServer): void {
  server.tool(
    "cre_secrets_create",
    "Create new DON-hosted secrets from a secrets YAML file. The file defines key-value pairs that are encrypted and stored on the DON.",
    {
      secretsFile: z.string().describe("Path to secrets YAML file"),
    },
    async ({ secretsFile }) => {
      const result = await runCli(["secrets", "create", secretsFile, "--yes"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_secrets_update",
    "Update existing DON-hosted secrets from a secrets YAML file.",
    {
      secretsFile: z.string().describe("Path to secrets YAML file"),
    },
    async ({ secretsFile }) => {
      const result = await runCli(["secrets", "update", secretsFile, "--yes"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_secrets_delete",
    "Delete DON-hosted secrets. This permanently removes the encrypted secrets.",
    {
      secretsFile: z.string().describe("Path to secrets YAML file identifying which secrets to delete"),
    },
    async ({ secretsFile }) => {
      const result = await runCli(["secrets", "delete", secretsFile, "--yes"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_secrets_list",
    "List all secret identifiers stored on the DON. Never returns secret values, only names/IDs.",
    {},
    async () => {
      const result = await runCli(["secrets", "list"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_secrets_execute",
    "Execute a pre-prepared multi-sig (MSIG) secrets bundle. The bundle must have been previously prepared and signed.",
    {
      bundlePath: z.string().describe("Path to the prepared MSIG bundle file"),
    },
    async ({ bundlePath }) => {
      const result = await runCli(["secrets", "execute", bundlePath]);
      return formatCliResult(result);
    }
  );
}
