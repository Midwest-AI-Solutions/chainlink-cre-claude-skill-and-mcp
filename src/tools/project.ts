import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli } from "../lib/cli-runner.js";
import { formatCliResult } from "../lib/output-parser.js";

export function registerProjectTools(server: McpServer): void {
  server.tool(
    "cre_init",
    "Initialize a new CRE project with workflow scaffolding. Creates project structure with workflow.yaml, handler code, and config files.",
    {
      projectName: z.string().describe("Name for the new CRE project"),
      workflowName: z.string().describe("Name for the initial workflow"),
      template: z
        .enum(["cron", "streams", "mercury", "custom-compute", "log-trigger", "on-demand"])
        .describe("Workflow template to use"),
      directory: z.string().optional().describe("Directory to create project in (defaults to current directory)"),
    },
    async ({ projectName, workflowName, template, directory }) => {
      const args = ["init", "-p", projectName, "-w", workflowName, "-t", template];
      const result = await runCli(args, { cwd: directory });
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_build",
    "Compile a CRE workflow to WASM binary using Bun bundler. The workflow path should point to the workflow directory containing the handler.",
    {
      workflowPath: z.string().describe("Path to workflow directory containing handler code"),
    },
    async ({ workflowPath }) => {
      const result = await runCli(["workflow", "custom-build", workflowPath], {
        timeout: 180_000,
      });
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_version",
    "Show the installed CRE CLI version.",
    {},
    async () => {
      const result = await runCli(["version"]);
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_update",
    "Update the CRE CLI to the latest version.",
    {},
    async () => {
      const result = await runCli(["update"], { timeout: 180_000 });
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_generate_bindings",
    "Generate language bindings from Solidity ABI files. Produces Go bindings by default for use in CRE workflow handlers.",
    {
      chainFamily: z.string().optional().default("evm").describe("Chain family (default: evm)"),
      abiPath: z.string().optional().describe("Path to ABI file or directory"),
      language: z.string().optional().default("go").describe("Output language (default: go)"),
    },
    async ({ chainFamily, abiPath, language }) => {
      const args = ["generate-bindings", chainFamily];
      if (abiPath) args.push("--abi", abiPath);
      if (language && language !== "go") args.push("--language", language);
      const result = await runCli(args, { timeout: 180_000 });
      return formatCliResult(result);
    }
  );
}
