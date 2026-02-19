import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli } from "../lib/cli-runner.js";
import { formatCliResult } from "../lib/output-parser.js";

export function registerWorkflowTools(server: McpServer): void {
  server.tool(
    "cre_workflow_simulate",
    "Run a local simulation of a CRE workflow. Executes the workflow handler against mock inputs without deploying to DON. Supports trigger-specific inputs and engine logging.",
    {
      workflowPath: z.string().describe("Path to workflow directory or workflow.yaml"),
      triggerIndex: z.number().optional().describe("0-based trigger index when workflow has multiple triggers"),
      evmTxHash: z.string().optional().describe("EVM transaction hash (for log-trigger simulation)"),
      evmEventIndex: z.number().optional().describe("0-based event index within the transaction (for log-trigger)"),
      httpPayload: z.string().optional().describe("HTTP payload as JSON string or @filepath (for http trigger)"),
      engineLogs: z.boolean().optional().describe("Enable engine-level logging for debugging"),
      broadcast: z.boolean().optional().describe("Broadcast EVM transactions during simulation"),
    },
    async ({ workflowPath, triggerIndex, evmTxHash, evmEventIndex, httpPayload, engineLogs, broadcast }) => {
      const args = ["workflow", "simulate", workflowPath, "--non-interactive"];
      if (triggerIndex !== undefined) args.push("--trigger-index", String(triggerIndex));
      if (evmTxHash) args.push("--evm-tx-hash", evmTxHash);
      if (evmEventIndex !== undefined) args.push("--evm-event-index", String(evmEventIndex));
      if (httpPayload) args.push("--http-payload", httpPayload);
      if (engineLogs) args.push("--engine-logs");
      if (broadcast) args.push("--broadcast");
      const result = await runCli(args, { timeout: 180_000 });
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_workflow_deploy",
    "Deploy a compiled CRE workflow to the Chainlink registry. The workflow must be built first with cre_build.",
    {
      workflowPath: z.string().describe("Path to workflow directory or workflow.yaml"),
    },
    async ({ workflowPath }) => {
      const result = await runCli(
        ["workflow", "deploy", workflowPath, "--yes"],
        { timeout: 300_000 }
      );
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_workflow_activate",
    "Activate a deployed CRE workflow on the DON. The workflow must be deployed first.",
    {
      workflowPath: z.string().describe("Path to workflow directory or workflow.yaml"),
    },
    async ({ workflowPath }) => {
      const result = await runCli(
        ["workflow", "activate", workflowPath, "--yes"],
        { timeout: 180_000 }
      );
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_workflow_pause",
    "Pause a running CRE workflow on the DON. Can be reactivated later.",
    {
      workflowPath: z.string().describe("Path to workflow directory or workflow.yaml"),
    },
    async ({ workflowPath }) => {
      const result = await runCli(
        ["workflow", "pause", workflowPath, "--yes"],
        { timeout: 180_000 }
      );
      return formatCliResult(result);
    }
  );

  server.tool(
    "cre_workflow_delete",
    "Permanently delete a CRE workflow from the DON. This cannot be undone.",
    {
      workflowPath: z.string().describe("Path to workflow directory or workflow.yaml"),
    },
    async ({ workflowPath }) => {
      const result = await runCli(
        ["workflow", "delete", workflowPath, "--yes"],
        { timeout: 180_000 }
      );
      return formatCliResult(result);
    }
  );
}
