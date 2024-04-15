import { extendProvider } from 'hardhat/config';
import {
  EIP1193Provider,
  HttpNetworkUserConfig,
  RequestArguments,
} from 'hardhat/types';
import { ProviderWrapperWithChainId } from 'hardhat/internal/core/providers/chainId';
import { HardhatPluginError } from 'hardhat/plugins';
import { v4 as uuid } from 'uuid';
import {
  CreateWeb3EthSignTransactionRequest,
  OneWeb3SignRequest,
  Web3Api,
} from '@safeheron/api-sdk';
import './type-extensions';

const PLUGIN_NAME = 'hardhat-safeheron';

export class SafeheronProvider extends ProviderWrapperWithChainId {
  constructor(
    protected readonly _wrappedProvider: EIP1193Provider,
    protected readonly _safeheronWeb3Api: Web3Api,
    protected readonly _web3WalletAccountKey: string,
    protected readonly _web3WalletEVMAddress: string,
  ) {
    super(_wrappedProvider);
  }

  private async getSignedTransaction(txKey: string): Promise<string> {
    const retrieveRequest: OneWeb3SignRequest = {
      txKey: txKey,
    };

    for (;;) {
      const retrieveResponse =
        await this._safeheronWeb3Api.oneWeb3Sign(retrieveRequest);
      if (
        retrieveResponse.transactionStatus === 'FAILED' ||
        retrieveResponse.transactionStatus === 'REJECTED'
      ) {
        throw new HardhatPluginError(
          PLUGIN_NAME,
          `eth_signTransaction was REJECTED or FAILED, please try again.`,
        );
      }
      if (retrieveResponse.transactionStatus === 'SIGN_COMPLETED') {
        console.log(`[${PLUGIN_NAME}]success, signature has been obtained`);
        return retrieveResponse.transaction.signedTransaction;
      }
      console.log(`[${PLUGIN_NAME}]Waiting for signature...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  private async createTransaction(args: RequestArguments): Promise<string> {
    const params = this._getParams(args);
    const tx = params[0];
    const request: CreateWeb3EthSignTransactionRequest = {
      customerRefId: uuid(),
      accountKey: this._web3WalletAccountKey,
      transaction: {
        value: parseInt(tx.value, 16).toString(),
        chainId: await this._getChainId(),
        gasLimit: parseInt(tx.gas, 16),
        maxPriorityFeePerGas: parseInt(tx.maxPriorityFeePerGas, 16).toString(),
        maxFeePerGas: parseInt(tx.maxFeePerGas, 16).toString(),
        gasPrice: parseInt(tx.gasPrice, 16).toString(),
        nonce: parseInt(tx.nonce, 16),
        data: tx.data,
        to: tx.to,
      },
    };
    const createResult =
      await this._safeheronWeb3Api.createWeb3EthSignTransaction(request);
    console.log(
      `[${PLUGIN_NAME}]request eth_signTransaction success, please review and approve on safeheron mobile app`,
    );
    return createResult.txKey;
  }

  public async request(args: RequestArguments) {
    switch (args.method) {
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return [this._web3WalletEVMAddress];
      case 'eth_sendTransaction':
        const txKey = await this.createTransaction(args);
        const signedTransaction = await this.getSignedTransaction(txKey);
        return this._wrappedProvider.request({
          method: 'eth_sendRawTransaction',
          params: [signedTransaction],
        });
      default:
        return this._wrappedProvider.request(args);
    }
  }
}

// extend provider to support safeheron mpc sign
extendProvider(async (provider, config, network) => {
  const rpcUrl = (config.networks[network] as HttpNetworkUserConfig).url || '';
  const safeheronConfig = (config.networks[network] as HttpNetworkUserConfig)
    .safeheron;
  if (safeheronConfig) {
    // check network, only public networks are supported
    if (
      network === 'hardhat' ||
      rpcUrl.includes('localhost') ||
      rpcUrl.includes('127.0.0.1')
    ) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        'only public networks are supported, please confirm your Networks configuration.',
      );
    }

    // check safeheron config
    if (
      !safeheronConfig.baseUrl ||
      !safeheronConfig.apiKey ||
      !safeheronConfig.rsaPrivateKey ||
      !safeheronConfig.safeheronRsaPublicKey ||
      !safeheronConfig.web3WalletAccountKey ||
      !safeheronConfig.web3WalletEVMAddress
    ) {
      throw new HardhatPluginError(PLUGIN_NAME, 'required config missing.');
    }

    const yourPrivateKey = safeheronConfig.rsaPrivateKey.trim();
    const safeheronPublicKey = safeheronConfig.safeheronRsaPublicKey.trim();

    const web3Api = new Web3Api({
      baseUrl: safeheronConfig.baseUrl,
      apiKey: safeheronConfig.apiKey,
      rsaPrivateKey: yourPrivateKey,
      safeheronRsaPublicKey: safeheronPublicKey,
      requestTimeout: safeheronConfig.requestTimeout!,
    });

    const safeheronProvider = new SafeheronProvider(
      provider,
      web3Api,
      safeheronConfig.web3WalletAccountKey,
      safeheronConfig.web3WalletEVMAddress,
    );
    return safeheronProvider;
  }

  return provider;
});
