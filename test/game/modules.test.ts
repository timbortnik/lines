import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Coverage only measures modules that get loaded, so this loads every rules module:
// an untested one then shows up as uncovered instead of silently passing.

const RULES = 'src/game';
const modules = readdirSync(RULES, { recursive: true, encoding: 'utf8' }).filter((name) => name.endsWith('.ts'));

test('the rules folder has modules', () => {
  assert.ok(modules.length > 0, `no .ts files under ${RULES}`);
});

test('no rules module switches coverage off', () => {
  for (const name of modules) {
    assert.ok(!readFileSync(`${RULES}/${name}`, 'utf8').includes('node:coverage'), `${name} contains node:coverage`);
  }
});

test('every rules module loads', async () => {
  for (const name of modules) await import(`../../${RULES}/${name.replace(/\.ts$/, '.js')}`);
});
