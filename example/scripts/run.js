#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const EXAMPLE_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(EXAMPLE_DIR, '..');

const log = (msg) => console.log(`[example] ${msg}`);

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

log(`plugin root: ${ROOT_DIR}`);
log(`example dir: ${EXAMPLE_DIR}`);

// 1. Build the plugin (parent) if lib/ is missing.
if (!fs.existsSync(path.join(ROOT_DIR, 'lib'))) {
  log('lib/ missing — installing & building plugin...');
  run('npm', ['install'], ROOT_DIR);
  run('npm', ['run', 'build'], ROOT_DIR);
} else {
  log('plugin lib/ found (delete lib/ to force rebuild)');
}

// 2. Install example dependencies if node_modules/ is missing.
if (!fs.existsSync(path.join(EXAMPLE_DIR, 'node_modules'))) {
  log('installing example dependencies...');
  run('npm', ['install'], EXAMPLE_DIR);
}

// 3. Bootstrap .env from template if absent, then stop so the user can fill it in.
const envFile = path.join(EXAMPLE_DIR, '.env');
const envTemplate = path.join(EXAMPLE_DIR, '.env.example');
if (!fs.existsSync(envFile)) {
  fs.copyFileSync(envTemplate, envFile);
  console.log('');
  log('.env created from .env.example.');
  log('Fill in your Safeheron credentials, then re-run.');
  log(`file: ${envFile}`);
  process.exit(1);
}

// 4. Deploy via Hardhat Ignition.
log('running hardhat ignition deploy...');
run('npm', ['run', 'deploy'], EXAMPLE_DIR);
