// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../.github/workflows/pr-quality-and-build.yml', import.meta.url),
  'utf8',
);
const summary = workflow.split('  lighthouse:\n')[1]?.split('  build:\n')[0];
const script = summary?.match(/ {8}run: \|\n((?: {10}.*\n)+)/)?.[1];

if (!summary || !script) {
  throw new Error('Required Lighthouse summary job or verification script is missing.');
}

describe('required Lighthouse check', () => {
  it.each(['failure', 'cancelled', 'skipped', ''])('rejects audit result %j', (result) => {
    const verification = spawnSync('bash', ['-e', '-c', script], {
      env: { ...process.env, AUDIT_RESULT: result },
      encoding: 'utf8',
    });

    expect(verification.error).toBeUndefined();
    expect(verification.status).toBe(1);
  });

  it('accepts successful audits', () => {
    const verification = spawnSync('bash', ['-e', '-c', script], {
      env: { ...process.env, AUDIT_RESULT: 'success' },
      encoding: 'utf8',
    });

    expect(verification.error).toBeUndefined();
    expect(verification.status).toBe(0);
  });

  it('runs after unsuccessful dependencies and skips only for explicit labels', () => {
    const condition = summary.match(/^ {4}if: (.+)$/m)?.[1];

    expect(condition).toBe(
      '${{ always() && needs.gate.outputs.skip_ci != \'true\' && needs.gate.outputs.skip_lighthouse != \'true\' }}',
    );
    expect(summary).toContain('    name: Lighthouse\n');
    expect(summary).toContain('    needs: [gate, lighthouse-audits]\n');
    expect(summary).toContain('AUDIT_RESULT: ${{ needs.lighthouse-audits.result }}');
  });
});
