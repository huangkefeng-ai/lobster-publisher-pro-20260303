import { spawnSync } from 'node:child_process';

const requiredLibs = ['libnspr4.so', 'libnss3.so', 'libatk-1.0.so.0'];

function hasLinuxLibrary(libName) {
  const result = spawnSync('bash', ['-lc', `ldconfig -p 2>/dev/null | grep -F "${libName}"`], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  return result.status === 0;
}

const missingLibs = requiredLibs.filter((lib) => !hasLinuxLibrary(lib));

if (missingLibs.length > 0) {
  console.error('Playwright e2e preflight failed: missing Linux shared libraries.');
  console.error(`Missing: ${missingLibs.join(', ')}`);
  console.error('Install browser dependencies, then re-run e2e tests.');
  console.error('Ubuntu/Debian: sudo npx playwright install --with-deps chromium');
  process.exit(1);
}

const run = spawnSync('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  shell: true,
});

if (typeof run.status === 'number') {
  process.exit(run.status);
}

process.exit(1);
