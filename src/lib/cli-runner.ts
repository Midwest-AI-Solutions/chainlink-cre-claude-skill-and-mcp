import { spawn } from "node:child_process";
import { requireCreCli } from "./cli-check.js";

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export interface RunOptions {
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
}

const DEFAULT_TIMEOUT = 120_000; // 2 minutes

export async function runCli(
  args: string[],
  options: RunOptions = {}
): Promise<CliResult> {
  const cliBin = requireCreCli();
  const { cwd, timeout = DEFAULT_TIMEOUT, env } = options;

  return new Promise((resolve) => {
    const proc = spawn(cliBin, args, {
      cwd,
      timeout,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const chunks: { out: Buffer[]; err: Buffer[] } = { out: [], err: [] };

    proc.stdout.on("data", (d: Buffer) => chunks.out.push(d));
    proc.stderr.on("data", (d: Buffer) => chunks.err.push(d));

    proc.on("close", (code) => {
      const stdout = Buffer.concat(chunks.out).toString("utf-8").trim();
      const stderr = Buffer.concat(chunks.err).toString("utf-8").trim();
      const exitCode = code ?? 1;
      resolve({ stdout, stderr, exitCode, success: exitCode === 0 });
    });

    proc.on("error", (err) => {
      resolve({
        stdout: "",
        stderr: err.message,
        exitCode: 1,
        success: false,
      });
    });
  });
}
