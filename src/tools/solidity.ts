import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatText } from "../lib/output-parser.js";

// KeystoneForwarder addresses per chain
const FORWARDER_ADDRESSES: Record<number, string> = {
  1: "0xa023508a8713ea1F53f04E2D790a59C8c498A584",       // Ethereum Mainnet
  42161: "0xa023508a8713ea1F53f04E2D790a59C8a498A584",    // Arbitrum One
  43114: "0xa023508a8713ea1F53f04E2D790a59C8a498A584",    // Avalanche C-Chain
  8453: "0xa023508a8713ea1F53f04E2D790a59C8a498A584",     // Base
  10: "0xa023508a8713ea1F53f04E2D790a59C8a498A584",       // Optimism
  137: "0xa023508a8713ea1F53f04E2D790a59C8a498A584",      // Polygon
  11155111: "0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD",  // Sepolia Testnet
  421614: "0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD",   // Arbitrum Sepolia
  84532: "0x233669cC2fba3F3b3537DAFA41070c7bb1e9cbfD",    // Base Sepolia
};

function getForwarderAddress(chainId: number): string {
  return FORWARDER_ADDRESSES[chainId] || "0x0000000000000000000000000000000000000000 /* UNKNOWN CHAIN — replace with actual forwarder address */";
}

export function registerSolidityTools(server: McpServer): void {
  server.tool(
    "cre_scaffold_receiver",
    "Generate a minimal IReceiver-implementing Solidity contract that accepts CRE workflow reports via KeystoneForwarder. This is the simplest on-chain integration point for CRE workflows using write-evm.",
    {
      contractName: z.string().describe("Name for the Solidity contract (e.g., WorkflowReceiver)"),
      chainId: z.number().describe("Target chain ID to resolve the KeystoneForwarder address"),
    },
    async ({ contractName, chainId }) => {
      const forwarder = getForwarderAddress(chainId);

      const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IReceiver
 * @notice Interface for contracts receiving CRE workflow reports via KeystoneForwarder.
 */
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

/**
 * @title ${contractName}
 * @notice Receives CRE workflow reports via KeystoneForwarder on chain ${chainId}.
 * @dev Only the KeystoneForwarder can call onReport. The metadata contains
 *      workflow ID, DON ID, and report context. The report contains the
 *      workflow handler's encoded output.
 */
contract ${contractName} is IReceiver {
    /// @notice KeystoneForwarder address for chain ${chainId}
    address public immutable forwarder;

    /// @notice Emitted when a report is received
    event ReportReceived(bytes metadata, bytes report);

    /// @notice Latest raw report data
    bytes public latestReport;
    uint256 public lastUpdated;

    error UnauthorizedForwarder(address caller);

    constructor() {
        forwarder = ${forwarder};
    }

    modifier onlyForwarder() {
        if (msg.sender != forwarder) revert UnauthorizedForwarder(msg.sender);
        _;
    }

    /// @inheritdoc IReceiver
    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        latestReport = report;
        lastUpdated = block.timestamp;
        emit ReportReceived(metadata, report);
    }
}
`;
      return formatText(code);
    }
  );

  server.tool(
    "cre_scaffold_consumer",
    "Generate a full CRE consumer contract with IReceiver implementation, custom report decoding, access control, events, and latest report storage. Use reportFields to define the structure of the workflow report.",
    {
      contractName: z.string().describe("Name for the consumer contract"),
      reportFields: z
        .array(
          z.object({
            name: z.string().describe("Field name (e.g., price, timestamp)"),
            type: z.string().describe("Solidity type (e.g., uint256, address, bytes32, string)"),
          })
        )
        .min(1)
        .describe("Fields in the workflow report struct"),
      chainId: z.number().describe("Target chain ID for KeystoneForwarder address"),
    },
    async ({ contractName, reportFields, chainId }) => {
      const forwarder = getForwarderAddress(chainId);

      const structFields = reportFields
        .map((f) => `        ${f.type} ${f.name};`)
        .join("\n");

      const decodeTypes = reportFields.map((f) => f.type).join(", ");
      const decodeNames = reportFields.map((f) => `decoded.${f.name}`).join(", ");
      const decodeAssignment = reportFields
        .map((f) => f.name)
        .join(", ");

      const eventParams = reportFields
        .map((f) => `${f.type} ${f.name}`)
        .join(", ");

      const emitArgs = reportFields
        .map((f) => `decoded.${f.name}`)
        .join(", ");

      const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IReceiver
 * @notice Interface for contracts receiving CRE workflow reports.
 */
interface IReceiver {
    function onReport(bytes calldata metadata, bytes calldata report) external;
}

/**
 * @title ${contractName}
 * @notice CRE workflow consumer contract on chain ${chainId}.
 *         Decodes structured reports and stores the latest values.
 */
contract ${contractName} is IReceiver {
    /// @notice Report data structure matching the workflow handler output
    struct Report {
${structFields}
    }

    /// @notice KeystoneForwarder address for chain ${chainId}
    address public immutable forwarder;

    /// @notice Latest decoded report
    Report public latestReport;
    uint256 public lastUpdated;

    /// @notice Emitted when a new report is decoded and stored
    event ReportDecoded(${eventParams}, uint256 timestamp);

    error UnauthorizedForwarder(address caller);

    constructor() {
        forwarder = ${forwarder};
    }

    modifier onlyForwarder() {
        if (msg.sender != forwarder) revert UnauthorizedForwarder(msg.sender);
        _;
    }

    /// @inheritdoc IReceiver
    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        Report memory decoded;
        (${decodeAssignment}) = abi.decode(report, (${decodeTypes}));
        decoded = Report(${decodeAssignment});

        latestReport = decoded;
        lastUpdated = block.timestamp;

        emit ReportDecoded(${emitArgs}, block.timestamp);
    }

    /// @notice Read the latest report values
    function getLatestReport() external view returns (Report memory) {
        return latestReport;
    }
}
`;
      return formatText(code);
    }
  );

  server.tool(
    "cre_scaffold_ccip_receiver",
    "Generate a CCIP cross-chain receiver contract that CRE workflows can target via write-evm. Receives messages from a specific source chain via Chainlink CCIP.",
    {
      contractName: z.string().describe("Name for the CCIP receiver contract"),
      sourceChainSelector: z.string().describe("CCIP chain selector for the source chain (uint64 as string)"),
    },
    async ({ contractName, sourceChainSelector }) => {
      const code = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

/**
 * @title ${contractName}
 * @notice CCIP cross-chain receiver for CRE workflows.
 *         Accepts messages from source chain selector ${sourceChainSelector}.
 */
contract ${contractName} is CCIPReceiver {
    /// @notice Expected source chain selector
    uint64 public immutable sourceChainSelector;

    /// @notice Latest received message
    bytes32 public latestMessageId;
    bytes public latestData;
    uint256 public lastUpdated;

    /// @notice Emitted when a cross-chain message is received
    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChain,
        address sender,
        bytes data
    );

    error InvalidSourceChain(uint64 received, uint64 expected);

    constructor(address _router) CCIPReceiver(_router) {
        sourceChainSelector = ${sourceChainSelector};
    }

    /// @dev Called by the CCIP router when a message arrives
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        if (message.sourceChainSelector != sourceChainSelector) {
            revert InvalidSourceChain(message.sourceChainSelector, sourceChainSelector);
        }

        latestMessageId = message.messageId;
        latestData = message.data;
        lastUpdated = block.timestamp;

        emit MessageReceived(
            message.messageId,
            message.sourceChainSelector,
            abi.decode(message.sender, (address)),
            message.data
        );
    }

    /// @notice Read the latest received message data
    function getLatestMessage() external view returns (bytes32 messageId, bytes memory data, uint256 timestamp) {
        return (latestMessageId, latestData, lastUpdated);
    }
}
`;
      return formatText(code);
    }
  );
}
