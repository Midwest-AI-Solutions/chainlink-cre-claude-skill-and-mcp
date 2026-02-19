import type { CliResult } from "./cli-runner.js";

export interface ToolResponse {
  [x: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function formatSuccess(result: CliResult): ToolResponse {
  const parts: string[] = [];
  if (result.stdout) parts.push(result.stdout);
  if (result.stderr) parts.push(`[stderr] ${result.stderr}`);
  return {
    content: [{ type: "text", text: parts.join("\n\n") || "Command completed successfully." }],
  };
}

export function formatError(result: CliResult): ToolResponse {
  const parts: string[] = [];
  if (result.stderr) parts.push(result.stderr);
  if (result.stdout) parts.push(result.stdout);
  return {
    content: [{ type: "text", text: parts.join("\n\n") || `Command failed with exit code ${result.exitCode}.` }],
    isError: true,
  };
}

export function formatCliResult(result: CliResult): ToolResponse {
  return result.success ? formatSuccess(result) : formatError(result);
}

export function formatText(text: string): ToolResponse {
  return { content: [{ type: "text", text }] };
}

export function formatErrorMessage(message: string): ToolResponse {
  return { content: [{ type: "text", text: message }], isError: true };
}

export function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
