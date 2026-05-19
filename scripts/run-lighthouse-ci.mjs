import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '..');
const lighthouseWorkDir = path.join(repoRoot, '.tmp/lighthouse');
const lighthouseConfig = path.join(repoRoot, '.lighthouserc.cjs');
const lhciCliPath = path.join(repoRoot, 'node_modules/@lhci/cli/src/cli.js');

const readyPattern = /Ready in/i;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (options.forwardStdout !== false) process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (options.forwardStderr !== false) process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated with signal ${signal}`));
        return;
      }

      if (code !== 0) {
        const error = new Error(`Command exited with code ${code}`);
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({stdout, stderr});
    });

    options.onChild?.(child);
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn('yarn', ['start'], {
      cwd: repoRoot,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let combinedOutput = '';
    let ready = false;

    const handleChunk = (chunk, stream) => {
      const text = chunk.toString();
      combinedOutput += text;
      process[stream].write(text);

      if (!ready && readyPattern.test(combinedOutput)) {
        ready = true;
        resolve(child);
      }
    };

    child.stdout.on('data', (chunk) => handleChunk(chunk, 'stdout'));
    child.stderr.on('data', (chunk) => handleChunk(chunk, 'stderr'));

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (ready) return;
      if (signal) {
        reject(new Error(`Next.js server terminated with signal ${signal}`));
        return;
      }
      reject(new Error(`Next.js server exited with code ${code ?? 1}`));
    });
  });
}

async function main() {
  fs.rmSync(lighthouseWorkDir, { recursive: true, force: true });
  fs.mkdirSync(lighthouseWorkDir, { recursive: true });

  const server = await startServer();
  let exitCode = 1;

  try {
    await runCommand(
      'node',
      [lhciCliPath, 'autorun', `--config=${lighthouseConfig}`],
      { cwd: lighthouseWorkDir }
    );
    exitCode = 0;
  } finally {
    if (!server.killed) server.kill('SIGTERM');
    process.exit(exitCode);
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});