#!/usr/bin/env node
'use strict';
// Negative tests for the proposal gates, plus one end-to-end write.
//
// Every gate here is asserted to reject for the reason claimed, not merely to
// reject: each case injects one defect and expects that defect's code. A
// negative test that passes for the wrong reason is pattern 8 of the guide.
//
// Usage:  node tools/test-gates.js     exit 0 = all cases behaved

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { validate } = require('./gate-proposal.js');

const ROOT = path.resolve(__dirname, '..');
const BASE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'example-proposal.json'), 'utf8'));

let failed = 0;
const clone = () => JSON.parse(JSON.stringify(BASE));

function expectCode(label, mutate, code) {
  const p = clone();
  mutate(p);
  const errs = validate(p);
  const hit = errs.some((e) => e.startsWith(code));
  if (hit) {
    console.log(`ok    ${label}: rejected with ${code}`);
  } else {
    console.log(`FAIL  ${label}: expected ${code}, got ${errs.length ? errs.join(' | ') : 'no error at all'}`);
    failed += 1;
  }
}

// The positive control first: without it, every rejection below could be the
// gate rejecting everything (pattern 3).
{
  const errs = validate(clone());
  if (errs.length === 0) {
    console.log('ok    positive control: the untouched fixture passes every gate');
  } else {
    console.log(`FAIL  positive control: the fixture should pass, got ${errs.join(' | ')}`);
    failed += 1;
  }
}

expectCode('missing field', (p) => { delete p.rule_en; }, 'E_FIELD');
expectCode('client work', (p) => { p.origin = 'client-work'; }, 'E_CLIENT');
expectCode('special category', (p) => {
  p.cases_en[0] += ' The record held a patient photograph.';
}, 'E_SENSITIVE');
expectCode('empty case', (p) => { p.cases_en = ['   ']; }, 'E_FIELD');
expectCode('unknown group', (p) => { p.group = 'Things I feel strongly about'; }, 'E_GROUP');
expectCode('language parity', (p) => { p.cases_pt = []; }, 'E_FIELD');
expectCode('check parity', (p) => { p.check_pt = [p.check_pt[0]]; }, 'E_PARITY');
expectCode('provenance', (p) => {
  p.cases_en = [p.cases_en[0].replace(' (measured)', '')];
  p.cases_pt = [p.cases_pt[0].replace(' (medido)', '')];
}, 'E_PROVENANCE');
expectCode('local path', (p) => { p.cases_en[0] += ' It lived in C:\\dev\\thing.'; }, 'E_ANON');
expectCode('email', (p) => { p.cases_en[0] += ' Reported by someone@example.com.'; }, 'E_ANON');
expectCode('record id', (p) => { p.cases_en[0] += ' The row was recA1b2C3d4E5f6G7.'; }, 'E_ANON');
expectCode('url', (p) => { p.check_en[0] += ' See https://example.com/docs.'; }, 'E_ANON');
expectCode('product name', (p) => { p.cases_en[0] += ' The job ran on GitHub Actions.'; }, 'E_PRODUCT');
expectCode('own brand', (p) => { p.cases_en[0] += ' The client was NordVask.'; }, 'E_PRIVATE');
expectCode('em dash', (p) => { p.rule_en = `An expectation \u2014 typed by hand \u2014 drifts into a description of the file.`; }, 'E_EMDASH');
expectCode('size', (p) => { p.title_en = 'Too short'; }, 'E_SIZE');
expectCode('title with full stop', (p) => { p.title_en = 'A gate that describes the file it guards.'; }, 'E_SIZE');
expectCode('duplicate title', (p) => { p.title_en = 'A green suite does not prove the gate runs'; }, 'E_DUP');
expectCode('duplicate rule', (p) => {
  // A rewording of the rule of pattern 15, which is the realistic shape of the
  // mistake: the same lesson arriving again in slightly different words.
  p.rule_en = 'A blocklist only catches what somebody remembered to list, so write the gate as a'
    + ' positive assertion: a closed allowlist of what is permitted, failing on anything outside it.';
}, 'E_DUP');

// ------------------------------------------------------------ end to end
// The writer is exercised on a copy of the repository, so the test can assert
// the result of a real write without touching the working tree.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'avl-e2e-'));
  for (const f of ['PATTERNS.md', 'PATTERNS.pt-BR.md', 'README.md', 'LICENSE', 'check.sh']) {
    fs.copyFileSync(path.join(ROOT, f), path.join(tmp, f));
  }
  fs.mkdirSync(path.join(tmp, 'tools', 'fixtures'), { recursive: true });
  for (const f of ['gate-proposal.js', 'add-pattern.js']) {
    fs.copyFileSync(path.join(__dirname, f), path.join(tmp, 'tools', f));
  }
  const propFile = path.join(tmp, 'proposal.json');
  fs.writeFileSync(propFile, JSON.stringify(BASE, null, 2));

  const before = Number(fs.readFileSync(path.join(tmp, 'PATTERNS.md'), 'utf8').match(/^(\d+) patterns,/m)[1]);
  try {
    execFileSync('node', [path.join(tmp, 'tools', 'add-pattern.js'), propFile], { cwd: tmp, encoding: 'utf8' });
  } catch (e) {
    console.log(`FAIL  end to end: writer exited nonzero\n${e.stdout || ''}${e.stderr || ''}`);
    failed += 1;
  }

  const en = fs.readFileSync(path.join(tmp, 'PATTERNS.md'), 'utf8');
  const pt = fs.readFileSync(path.join(tmp, 'PATTERNS.pt-BR.md'), 'utf8');
  const rm = fs.readFileSync(path.join(tmp, 'README.md'), 'utf8');
  const N = before + 1;
  const checks = [
    [`EN heading ${N}`, new RegExp(`^## ${N}\\. ${BASE.title_en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(en)],
    [`PT heading ${N}`, new RegExp(`^## ${N}\\. `, 'm').test(pt)],
    [`EN index entry ${N}`, new RegExp(`^${N}\\. \\[`, 'm').test(en)],
    [`PT index entry ${N}`, new RegExp(`^${N}\\. \\[`, 'm').test(pt)],
    [`README entry ${N}`, new RegExp(`^${N}\\. `, 'm').test(rm)],
    [`stated count EN is ${N}`, new RegExp(`^${N} patterns,`, 'm').test(en)],
    [`stated count PT is ${N}`, new RegExp(`^${N} padrões,`, 'm').test(pt)],
    [`stated count README is ${N}`, new RegExp(`^${N} verification patterns`, 'm').test(rm)],
    // The clause is rewrapped into the paragraph, so compare on normalized space.
    ['short version carries the new clause EN', en.replace(/\s+/g, ' ').includes(BASE.short_en)],
    ['short version carries the new clause PT', pt.replace(/\s+/g, ' ').includes(BASE.short_pt)],
  ];
  for (const [label, okish] of checks) {
    if (okish) console.log(`ok    end to end: ${label}`);
    else { console.log(`FAIL  end to end: ${label}`); failed += 1; }
  }

  try {
    execFileSync('sh', ['check.sh'], { cwd: tmp, encoding: 'utf8' });
    console.log('ok    end to end: check.sh accepts the written result');
  } catch (e) {
    console.log(`FAIL  end to end: check.sh rejected the written result\n${e.stdout || ''}`);
    failed += 1;
  }

  // Writing the same lesson twice is the likeliest real mistake: a session
  // closes on a lesson the guide already carries.
  try {
    execFileSync('node', [path.join(tmp, 'tools', 'add-pattern.js'), propFile], { cwd: tmp, encoding: 'utf8' });
    console.log('FAIL  end to end: the second write of the same proposal was accepted');
    failed += 1;
  } catch (e) {
    const out = `${e.stdout || ''}`;
    if (out.includes('E_DUP')) console.log('ok    end to end: the same proposal a second time is rejected with E_DUP');
    else { console.log(`FAIL  end to end: second write rejected for the wrong reason\n${out}`); failed += 1; }
  }

  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(failed === 0 ? 'PASS' : `FAILED  ${failed} case(s)`);
process.exit(failed === 0 ? 0 : 1);
