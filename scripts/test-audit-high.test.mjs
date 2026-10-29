import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit } from './audit-high.mjs';

const report = (high = 0, moderate = 0) => JSON.stringify({ metadata: { vulnerabilities: { info: 0, low: 0, moderate, high, critical: 0, total: high + moderate } }, vulnerabilities: {} });
const failure = (stdout, status = 1) => () => { throw Object.assign(new Error('npm failed'), { stdout, status }); };

test('clean audit succeeds and moderate-only reports retain the high severity threshold', () => {
  assert.equal(audit('.', 'Fixture', () => report()), 0);
  assert.equal(audit('.', 'Fixture', failure(report(0, 1))), 0);
});
test('high vulnerabilities fail even when npm exits 1', () => {
  assert.equal(audit('.', 'Fixture', failure(report(2))), 2);
});
test('registry errors and missing, malformed or inconsistent counts never pass', () => {
  for (const output of ['{}', '{"error":{"code":"E503"}}', 'not json', 'null', '{"metadata":{"vulnerabilities":{"high":0,"critical":0}}}', report().replace('"total":0', '"total":1')]) {
    assert.equal(audit('.', 'Fixture', failure(output)), 1);
  }
});
test('execution failure or timeout never passes with clean-looking stdout', () => {
  assert.equal(audit('.', 'Fixture', failure(report())), 1);
  assert.equal(audit('.', 'Fixture', failure(report(), 2)), 1);
  assert.equal(audit('.', 'Fixture', failure(report(), null)), 1);
});
