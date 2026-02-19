import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerSolidityResources(server: McpServer): void {
  server.resource(
    "ireceiver-interface",
    "cre://contracts/ireceiver",
    { description: "IReceiver interface specification + KeystoneForwarder integration guide", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://contracts/ireceiver",
          mimeType: "text/markdown",
          text: `# IReceiver Interface — CRE On-Chain Integration

## Interface

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReceiver {
    /// @notice Called by KeystoneForwarder to deliver a CRE workflow report.
    /// @param metadata Encoded metadata: workflow ID, DON ID, report context
    /// @param report   ABI-encoded report data from the workflow handler
    function onReport(bytes calldata metadata, bytes calldata report) external;
}
\`\`\`

## How It Works

1. A CRE workflow uses the \`write-evm\` capability to send a report on-chain.
2. The DON nodes sign the report and submit it to the **KeystoneForwarder** contract.
3. The forwarder verifies the DON signatures, then calls \`onReport()\` on your contract.
4. Your contract decodes the report and processes the data.

## Metadata Format

The \`metadata\` parameter contains:
- **Workflow ID** (bytes32) — unique identifier for the workflow
- **DON ID** (uint32) — which DON produced the report
- **Workflow execution ID** (bytes32) — unique per execution
- **Workflow owner** (address) — owner of the workflow

## Security Model

- **Only the KeystoneForwarder** should be allowed to call \`onReport()\`.
- Always verify \`msg.sender == forwarder\` in your implementation.
- The forwarder already verifies DON signatures before calling your contract.
- Never allow arbitrary callers to invoke \`onReport()\`.

## Report Encoding

Reports are ABI-encoded by the workflow handler's return value. Use \`abi.decode()\` with the expected types:

\`\`\`solidity
(uint256 price, uint256 timestamp) = abi.decode(report, (uint256, uint256));
\`\`\`

## Installation

\`\`\`bash
# Foundry
forge install smartcontractkit/chainlink

# Hardhat
npm install @chainlink/contracts
\`\`\`
`,
        },
      ],
    })
  );

  server.resource(
    "consumer-contract-template",
    "cre://contracts/consumer-template",
    { description: "Full annotated CRE consumer contract template with report decoding", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://contracts/consumer-template",
          mimeType: "text/markdown",
          text: `# CRE Consumer Contract Template

A complete, annotated template for receiving and decoding CRE workflow reports.

## Template

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

/// @title CREConsumer
/// @notice Template for consuming CRE workflow reports.
///         Customize the Report struct to match your workflow handler output.
contract CREConsumer is IReceiver {
    // ─── Customize: define your report structure ───
    struct Report {
        uint256 price;       // Example: asset price (18 decimals)
        uint256 timestamp;   // Example: observation timestamp
        bytes32 feedId;      // Example: Data Streams feed ID
    }

    address public immutable forwarder;
    Report public latestReport;
    uint256 public lastUpdated;

    event ReportDecoded(uint256 price, uint256 timestamp, bytes32 feedId);
    error UnauthorizedForwarder(address caller);

    constructor(address _forwarder) {
        forwarder = _forwarder;
    }

    modifier onlyForwarder() {
        if (msg.sender != forwarder) revert UnauthorizedForwarder(msg.sender);
        _;
    }

    function onReport(bytes calldata, bytes calldata report) external onlyForwarder {
        // ─── Customize: decode to match your Report struct ───
        (uint256 price, uint256 timestamp, bytes32 feedId) =
            abi.decode(report, (uint256, uint256, bytes32));

        latestReport = Report(price, timestamp, feedId);
        lastUpdated = block.timestamp;

        emit ReportDecoded(price, timestamp, feedId);
    }

    function getLatestReport() external view returns (Report memory) {
        return latestReport;
    }
}
\`\`\`

## Customization Steps

1. **Modify the \`Report\` struct** to match your workflow handler's return type.
2. **Update the \`abi.decode()\` call** with the matching Solidity types.
3. **Update the event** to emit the fields you care about.
4. **Set the forwarder address** for your target chain (see \`cre://docs/forwarder-addresses\`).
5. **Deploy** with Foundry or Hardhat.

## Workflow Handler ↔ Contract Mapping

| Handler Return | Solidity Type |
|----------------|---------------|
| \`number\` / \`bigint\` | \`uint256\` or \`int256\` |
| \`string\` (hex) | \`bytes32\` or \`address\` |
| \`string\` (text) | \`string\` |
| \`Uint8Array\` | \`bytes\` |
| \`boolean\` | \`bool\` |
`,
        },
      ],
    })
  );

  server.resource(
    "forwarder-addresses",
    "cre://docs/forwarder-addresses",
    { description: "KeystoneForwarder and Workflow Registry addresses by chain", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://docs/forwarder-addresses",
          mimeType: "text/markdown",
          text: `# CRE Contract Addresses

## KeystoneForwarder

The KeystoneForwarder receives DON-signed reports and delivers them to your IReceiver contract.

### Mainnet

| Chain | Chain ID | Address |
|-------|----------|---------|
| Ethereum | 1 | \`0xa023508a8713ea1F53f04E2D790a59C8c498A584\` |
| Arbitrum One | 42161 | \`0xa023508a8713ea1F53f04E2D790a59C8a498A584\` |
| Avalanche C-Chain | 43114 | \`0xa023508a8713ea1F53f04E2D790a59C8a498A584\` |
| Base | 8453 | \`0xa023508a8713ea1F53f04E2D790a59C8a498A584\` |
| Optimism | 10 | \`0xa023508a8713ea1F53f04E2D790a59C8a498A584\` |
| Polygon | 137 | \`0xa023508a8713ea1F53f04E2D790a59C8a498A584\` |

### Testnet

| Chain | Chain ID | Address |
|-------|----------|---------|
| Sepolia | 11155111 | \`0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD\` |
| Arbitrum Sepolia | 421614 | \`0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD\` |
| Base Sepolia | 84532 | \`0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD\` |

## Workflow Registry

The Workflow Registry stores deployed workflow metadata and WASM binaries.

| Network | Address |
|---------|---------|
| Mainnet | \`0x....\` (check \`cre workflow deploy\` output for current address) |
| Testnet (Sepolia) | \`0x....\` (check \`cre workflow deploy\` output for current address) |

> **Note**: Registry addresses are managed by the CRE CLI. Use \`cre workflow deploy\` and
> the CLI will resolve the correct registry for your configured network.

## Finding Addresses

If your chain is not listed above, check:
1. [Chainlink Documentation](https://docs.chain.link/chainlink-automation/overview/supported-networks)
2. \`cre version\` — newer CLI versions may support additional chains
3. The [CRE GitHub repository](https://github.com/smartcontractkit/chainlink) for latest deployments
`,
        },
      ],
    })
  );

  server.resource(
    "solidity-integration-guide",
    "cre://docs/solidity-integration",
    { description: "End-to-end guide: CRE workflow → on-chain write → consumer contract", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "cre://docs/solidity-integration",
          mimeType: "text/markdown",
          text: `# CRE Solidity Integration Guide

End-to-end walkthrough: build a CRE workflow that writes data to a smart contract.

## Architecture

\`\`\`
[Trigger] → [Handler (WASM)] → [write-evm capability]
                                       ↓
                               [KeystoneForwarder]
                                       ↓
                              [Your IReceiver Contract]
\`\`\`

## Step 1: Create the Workflow

\`\`\`bash
cre init -p my-project -w price-writer -t streams
\`\`\`

## Step 2: Write the Handler

The handler processes trigger data and returns the report that will be written on-chain:

\`\`\`typescript
export async function handler(triggerOutput: unknown): Promise<unknown> {
  const { price, timestamp } = triggerOutput as { price: bigint; timestamp: number };

  // Return ABI-compatible values — these get encoded and sent to your contract
  return {
    price,
    timestamp: BigInt(timestamp),
  };
}
\`\`\`

## Step 3: Configure write-evm Capability

In \`workflow.yaml\`:

\`\`\`yaml
capabilities:
  - type: write-evm
    config:
      chainId: 11155111           # Sepolia testnet
      contractAddress: "0x..."    # Your deployed IReceiver contract
      method: "onReport(bytes,bytes)"
      gasLimit: 300000
\`\`\`

## Step 4: Deploy the Consumer Contract

Use the \`cre_scaffold_consumer\` tool to generate a contract, then deploy:

\`\`\`bash
# Foundry
forge create src/PriceConsumer.sol:PriceConsumer \\
  --rpc-url $SEPOLIA_RPC \\
  --private-key $DEPLOYER_KEY

# Hardhat
npx hardhat run scripts/deploy.ts --network sepolia
\`\`\`

## Step 5: Build, Simulate, Deploy

\`\`\`bash
cre workflow custom-build ./workflows/price-writer
cre workflow simulate ./workflows/price-writer
cre workflow deploy ./workflows/price-writer
cre workflow activate ./workflows/price-writer
\`\`\`

## Step 6: Verify

- Check your contract's \`latestReport\` storage after the workflow runs
- Monitor the \`ReportDecoded\` event on a block explorer
- Use \`cre workflow simulate --engine-logs\` to debug the workflow execution

## Common Patterns

### Price Feed Consumer
Workflow reads Data Streams, writes price + timestamp to contract.

### Cross-Chain Relay
Workflow reads state on chain A, writes via CCIP to chain B.

### Event Reactor
Log-trigger watches for events, handler processes them, writes result on-chain.

### Aggregator
HTTP-client fetches multiple APIs, consensus aggregates, writes median on-chain.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| \`UnauthorizedForwarder\` | Verify forwarder address matches your chain ID |
| Report decode fails | Ensure handler return types match \`abi.decode()\` types exactly |
| Transaction reverts | Check gas limit in write-evm config (300k+ recommended) |
| No report received | Verify workflow is activated: \`cre workflow activate\` |
`,
        },
      ],
    })
  );
}
