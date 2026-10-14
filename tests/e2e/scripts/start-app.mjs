// Installs the packed plugin into a copy of the test app and starts Strapi
// The app lives outside the repository so it can't resolve the plugin's own node_modules
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const template = path.join(root, 'tests/e2e/app');
const appDir = path.resolve(
  process.env.E2E_APP_DIR ?? path.join(os.tmpdir(), 'strapi-plugin-multi-select-e2e')
);

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = {
  ...process.env,
  STRAPI_TELEMETRY_DISABLED: 'true',
  STRAPI_DISABLE_UPDATE_NOTIFICATION: 'true',
};

// Playwright only shows the web server's stderr outside of CI
const log = (message) => console.error(`[e2e] ${message}`);
const run = (cwd, args) => execFileSync(npm, args, { cwd, env, stdio: 'inherit' });

log('Building the plugin');
run(root, ['run', 'build']);

log(`Packing the plugin into ${appDir}`);
mkdirSync(appDir, { recursive: true });
for (const file of readdirSync(appDir)) {
  if (file.endsWith('.tgz')) rmSync(path.join(appDir, file));
}
const [{ filename }] = JSON.parse(
  execFileSync(npm, ['pack', '--json', '--pack-destination', appDir], {
    cwd: root,
    env,
    encoding: 'utf8',
  })
);
// A content-based name makes npm reinstall the plugin when it changes
const hash = createHash('sha256')
  .update(readFileSync(path.join(appDir, filename)))
  .digest('hex')
  .slice(0, 12);
const tarball = `strapi-plugin-multi-select-${hash}.tgz`;
renameSync(path.join(appDir, filename), path.join(appDir, tarball));

log('Copying the test app');
for (const entry of ['config', 'src', 'public', 'types', 'dist', '.strapi', '.tmp']) {
  rmSync(path.join(appDir, entry), { recursive: true, force: true });
}
cpSync(template, appDir, { recursive: true });
const pkg = JSON.parse(readFileSync(path.join(template, 'package.json'), 'utf8'));
pkg.dependencies['strapi-plugin-multi-select'] = `file:./${tarball}`;
writeFileSync(path.join(appDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

log('Installing dependencies');
run(appDir, ['install', '--no-audit', '--no-fund']);

log('Building the admin panel');
run(appDir, ['run', 'build']);

log('Starting Strapi');
const strapi = spawn(npm, ['run', 'develop', '--', '--no-watch-admin', '--no-build-admin'], {
  cwd: appDir,
  env,
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => strapi.kill(signal));
}
strapi.on('exit', (code) => process.exit(code ?? 1));
