// If your plugin extends types from another plugin, you should import the plugin here.

// To extend one of Hardhat's types, you need to import the module where it has been defined, and redeclare it.
import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HttpNetworkUserConfig {
    safeheron?: {
      baseUrl: string;
      apiKey: string;
      rsaPrivateKey: string;
      safeheronRsaPublicKey: string;
      requestTimeout?: number;
      web3WalletAccountKey: string;
      web3WalletEVMAddress: string;
    };
  }
  interface HttpNetworkConfig {
    safeheron?: {
      baseUrl: string;
      apiKey: string;
      rsaPrivateKey: string;
      safeheronRsaPublicKey: string;
      requestTimeout?: number;
      web3WalletAccountKey: string;
      web3WalletEVMAddress: string;
    };
  }
}
