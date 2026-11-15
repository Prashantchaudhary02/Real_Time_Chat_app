import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting PulseChat Fullstack App in development mode...\n');

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true
});

function logOutput(prefix, colorCode, data) {
  const lines = data.toString().split('\n');
  for (const line of lines) {
    if (line.trim()) {
      console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
    }
  }
}

server.stdout.on('data', (d) => logOutput('Server', '34', d));
server.stderr.on('data', (d) => logOutput('Server Error', '31', d));

client.stdout.on('data', (d) => logOutput('Client', '32', d));
client.stderr.on('data', (d) => logOutput('Client Error', '31', d));

const shutdown = () => {
  console.log('\n🛑 Shutting down PulseChat processes...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
