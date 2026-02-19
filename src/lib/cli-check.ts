import { accessSync, constants } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

const DEFAULT_CRE_PATH = resolve(homedir(), ".cre", "bin", "cre");

export function getCreCliPath(): string {
  return process.env.CRE_CLI_PATH
    ? resolve(process.env.CRE_CLI_PATH.replace("~", homedir()))
    : DEFAULT_CRE_PATH;
}

export function isCreCliAvailable(): boolean {
  try {
    accessSync(getCreCliPath(), constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function requireCreCli(): string {
  const path = getCreCliPath();
  if (!isCreCliAvailable()) {
    throw new Error(
      `CRE CLI not found at ${path}. Install it with: curl -sSfL https://raw.githubusercontent.com/smartcontractkit/cre-cli/main/install/install.sh | bash`
    );
  }
  return path;
}
