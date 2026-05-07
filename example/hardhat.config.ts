/*
 * WARNING: Reference example only. Do not use this configuration in
 * production as-is. Review secret management, network parameters, gas
 * controls, and signing policy for your deployment before going live.
 */
import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@safeheron/hardhat-safeheron";

const {
  SAFEHERON_BASE_URL,
  SAFEHERON_API_KEY,
  SAFEHERON_RSA_PRIVATE_KEY_PATH,
  SAFEHERON_RSA_PUBLIC_KEY_PATH,
  SAFEHERON_WEB3_ACCOUNT_KEY,
  SAFEHERON_WEB3_EVM_ADDRESS,
  SEPOLIA_RPC_URL,
} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      safeheron: {
        baseUrl: SAFEHERON_BASE_URL || "",
        apiKey: SAFEHERON_API_KEY || "",
        // Two ways to provide RSA keys:
        //   1. file path with `file:` prefix (loaded by the SDK)
        //   2. raw PEM string starting with "-----BEGIN ...-----"
        rsaPrivateKey: `file:${SAFEHERON_RSA_PRIVATE_KEY_PATH}`,
        safeheronRsaPublicKey: `file:${SAFEHERON_RSA_PUBLIC_KEY_PATH}`,
        requestTimeout: 10000,
        web3WalletAccountKey: SAFEHERON_WEB3_ACCOUNT_KEY || "",
        web3WalletEVMAddress: SAFEHERON_WEB3_EVM_ADDRESS || "",
      },
    },
  },
};

export default config;
