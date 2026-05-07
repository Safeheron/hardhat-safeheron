# Safeheron Hardhat Plugin Example

A minimal, runnable Hardhat project that deploys a standard OpenZeppelin ERC20 token (`ExampleToken`, symbol `EXT`, initial supply 1,000,000) to Sepolia using `@safeheron/hardhat-safeheron`.

> **WARNING — for reference only. Do not use this example directly in production.**
>
> It is intentionally minimal to illustrate plugin wiring. Before any production use, review at least:
> - **Secret management.** `.env` is fine for a demo; production should use a real secrets manager and never load private keys from a working tree.
> - **Network config.** Sepolia values here (RPC, timeout) are demo-grade; verify gas, timeouts, and confirmation settings for your real network.
> - **Contract code.** The OZ ERC20 used here is unaudited as deployed by this example; treat any token minted from it as a demo asset.
> - **Signing policy.** Each transaction requires a manual approval in the Safeheron mobile app — ensure that matches your operational model.

## Prerequisites

- Node.js (`>16 <=18.18`)
- A Safeheron Open API key, RSA key pair, and a Web3 wallet — see https://safeheron.com
- A Sepolia RPC endpoint (Infura / Alchemy / your own node)

## Quick start

From this directory:

```bash
npm start
```

`scripts/run.js` will, in order:

1. Build the plugin in the repo root if `../lib` is missing.
2. Install this project's dependencies if `node_modules/` is missing.
3. Bootstrap `.env` from `.env.example` and exit so you can fill in credentials.
4. Run `hardhat ignition deploy` once `.env` is populated.

So a typical first-time flow is `npm start` → fill in `.env` → `npm start` again. The deployment triggers a signing request that you must approve in the Safeheron mobile app before it broadcasts.

## Manual steps (equivalent)

If you prefer to run each step yourself:

1. Build the plugin from the repo root (the example references it via `file:..`):

   ```bash
   cd ..
   npm install
   npm run build
   ```

2. Install example dependencies:

   ```bash
   cd example
   npm install
   ```

3. Copy the environment template and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

4. Run the deployment:

   ```bash
   npm run deploy
   ```

   Hardhat Ignition will prompt you to confirm the deployment to Sepolia. Type `confirm` and press Enter. The deployment then triggers a signing request — approve it in the Safeheron mobile app.

## Interact with the deployed contract

After `deploy` succeeds, run:

```bash
npm run interact
```

This executes [scripts/interact.ts](scripts/interact.ts) via `hardhat run --network sepolia`, which routes every state-changing call through `SafeheronProvider` — the same signing path used during deployment. The demo issues:

1. `transfer(from, 1)` — smallest possible unit (1 wei of EXT), transferred to self.
2. `approve(from, 1)` followed by an `allowance` read to confirm the change landed.

Each write triggers a Safeheron mobile-app approval. Self-transfer / self-approve still exercises the full signing path, so no extra configuration is needed beyond the deployment credentials.

To exercise the legacy (non-EIP-1559) gas path in the plugin, run:

```bash
npm run interact:legacy
```

This calls [scripts/interact-legacy.ts](scripts/interact-legacy.ts), which passes `gasPrice` explicitly and sets `type: 0` so the transaction is signed as a legacy tx. Useful for verifying both gas branches in `SafeheronProvider.createTransaction` end-to-end.

## Files

| Path | Purpose |
| --- | --- |
| `hardhat.config.ts` | Network configuration using `safeheron` extension, env-driven |
| `contracts/ExampleToken.sol` | OpenZeppelin-based ERC20 token |
| `ignition/modules/ExampleToken.ts` | Hardhat Ignition deployment module |
| `.env.example` | Environment variable template (copy to `.env`) |
| `scripts/run.js` | One-shot setup + deploy driver invoked by `npm start` |
| `scripts/interact.ts` | Post-deploy demo of non-deployment contract calls (`npm run interact`) |
| `scripts/interact-legacy.ts` | Same as `interact.ts` but forces a legacy (type 0) gas tx (`npm run interact:legacy`) |
