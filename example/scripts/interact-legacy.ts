// Forces the legacy (type 0) gas branch in SafeheronProvider.createTransaction
// by passing `gasPrice` explicitly so maxFeePerGas / maxPriorityFeePerGas are
// absent. The default `interact.ts` exercises the EIP-1559 branch; this script
// covers the other half.
//
// Run with:
//   npm run interact:legacy
// or:
//   npx hardhat run scripts/interact-legacy.ts --network sepolia

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployedAddressesPath = path.join(
    __dirname,
    "../ignition/deployments/chain-11155111/deployed_addresses.json"
  );
  if (!fs.existsSync(deployedAddressesPath)) {
    throw new Error(
      `No deployment found. Run 'npm run deploy' first.\nExpected: ${deployedAddressesPath}`
    );
  }
  const deployed = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf-8"));
  const tokenAddress: string = deployed["ExampleTokenModule#ExampleToken"];

  const [from] = await ethers.getSigners();
  const token = await ethers.getContractAt("ExampleToken", tokenAddress);

  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  console.log(`token:    ${tokenAddress}`);
  console.log(`from:     ${from.address}`);
  console.log(`gasPrice: ${gasPrice} wei (legacy tx)`);

  console.log(
    "\n[1/1] transfer 1 EXT-wei (legacy gas) — approve in Safeheron app..."
  );
  const tx = await token.transfer(from.address, 1n, { type: 0, gasPrice });
  await tx.wait();
  console.log(`      tx: ${tx.hash}`);
}

main().catch((err) => {
  console.error("interact-legacy failed:", err);
  if (err?.data) console.error("data:", err.data);
  if (err?.cause) console.error("cause:", err.cause);
  process.exit(1);
});
