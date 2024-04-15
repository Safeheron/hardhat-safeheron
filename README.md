# Safeheron Hardhat Plugin

This is a [Hardhat](https://hardhat.org/) plugin for integrating with [Safeheron](https://www.safeheron.com).

This plugin will help you to seamlessly integrate Safeheron into your Hardhat development stack.

You can use it to deploy contracts and sign transactions.

## Installation

```bash
npm install @safeheron/hardhat-safeheron
```

## Usage

Configure your `hardhat.config.js` in your hardhat project.

```javascript
import "@safeheron/hardhat-safeheron";

const config: HardhatUserConfig = {
  // other configs
  //...
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/8026****2fcb",
      safeheron: {
        baseUrl: '<Safeheron Open API Url>',
        apiKey: '3fae****25d2',
        // Here are two configuration options:
        // 1. Configure the path to the private key file, for example: file:/path/to/your/private/key/file.pem
        // 2. Configure the private key content in string format, for example: -----BEGIN PRIVATE KEY-----\nMIIJQgIBADANBgkqhkiG****ICAQDidDHYV73U4cub\n-----END PUBLIC KEY-----
        rsaPrivateKey: "-----BEGIN PRIVATE KEY-----\nMIIJQgIBADANBgkqh****mCAruusbobkuJ3rB6h\n-----END PRIVATE KEY-----",
        // You can get safeheronRsaPublicKey from Safeheron Web Console. Here are two configuration options:
        // 1. Save safeheronRsaPublicKey to a file and configure the path to the file, for example: file:/path/to/safeheron/public/key/file.pem
        // 2. Directly paste the public key that you copied from the web console, for example: MIICIjANBgkqhki****8eUQV63wRS0CAwEAAQ==
        safeheronRsaPublicKey: "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0B****S0CAwEAAQ==\n-----END PUBLIC KEY-----",
        requestTimeout: 10000,
        web3WalletAccountKey: "accoun****8e74f",
        web3WalletEVMAddress: "0x426e6****D14DDE"
      }
    }
  },
};

export default config;
```

## QA

1. How to get `web3WalletAccountKey` and `web3WalletEVMAddress` ?

Please open [Safeheron Web Console](https://www.safeheron.com/console/wallet), choose an Web3 wallet which you want to use,
click to go to wallet detail page,
then you will see a link like https://www.safeheron.com/console/wallet/account58xxxxcbf34_web3 in your browser address bar,
the `account58xxxxcbf34` string without `_web3` suffix is your web3 account key.
And you can also copy your Web3 EVM address at the top of this page.
