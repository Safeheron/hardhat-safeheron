// Demonstrates non-deployment contract calls routed through SafeheronProvider.
// Run with:
//   npm run interact
// or:
//   npx hardhat run scripts/interact.ts --network sepolia
//
// Each write call (transfer / approve) goes through the plugin's signing path
// and must be approved in the Safeheron mobile app before broadcast. Reads
// after the writes are only there to confirm the on-chain effect.

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

  console.log(`token: ${tokenAddress}`);
  console.log(`from:  ${from.address}`);

  // 1. transfer the smallest possible amount (1 wei of EXT) to self.
  console.log("\n[1/2] transfer 1 EXT-wei — approve in Safeheron app...");
  const transferTx = await token.transfer(from.address, 1n);
  await transferTx.wait();
  console.log(`      tx: ${transferTx.hash}`);

  // 2. approve the smallest possible amount to self, then read the allowance.
  console.log("\n[2/2] approve 1 EXT-wei — approve in Safeheron app...");
  const approveTx = await token.approve(from.address, 1n);
  await approveTx.wait();
  console.log(`      tx: ${approveTx.hash}`);

  const allowance = await token.allowance(from.address, from.address);
  console.log(`      allowance(from, from) = ${allowance.toString()}`);
}

main().catch((err) => {
  console.error("interact failed:", err);
  if (err?.data) console.error("data:", err.data);
  if (err?.cause) console.error("cause:", err.cause);
  process.exit(1);
});
