import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { preview } from 'vite';

const server = await preview({
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});

try {
  const url = 'http://127.0.0.1:4173';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Preview returned HTTP ${response.status} at ${url}`);
  }
  await response.arrayBuffer();
  await mkdir('reports/lighthouse', { recursive: true });
  console.log(`Running Lighthouse against ${url}`);

  // Invoke npm through Node so this also works with npm.cmd on Windows.
  process.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        process.env.npm_execpath,
        'exec',
        '--yes',
        '--package=lighthouse@12.8.2',
        '--',
        'lighthouse',
        url,
        '--output=html',
        '--output-path=./reports/lighthouse/index.html',
        '--chrome-flags=--headless',
      ],
      { stdio: 'inherit' },
    );
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  await new Promise((resolve, reject) => {
    server.httpServer.close((error) => (error ? reject(error) : resolve()));
    server.httpServer.closeAllConnections();
  });
}
