#!/usr/bin/env node
'use strict';
// Writes a gated proposal into the guide, in both languages, and leaves the
// repository in a state check.sh accepts or in the state it was already in.
//
// Numbering is append-only: a new pattern is always N+1, never inserted in the
// middle, because "pattern 14" is an address other documents and briefings
// already point at. The index groups it with its siblings even though its
// number is the highest.
//
// Usage:  node tools/add-pattern.js proposal.json [--push] [--dry]
//         exit 0 = written (and committed, with --push), 1 = nothing written

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { validate } = require('./gate-proposal.js');

const ROOT = path.resolve(__dirname, '..');
const FILES = {
  en: path.join(ROOT, 'PATTERNS.md'),
  pt: path.join(ROOT, 'PATTERNS.pt-BR.md'),
  readme: path.join(ROOT, 'README.md'),
};
const WIDTH = 97;

// ---------------------------------------------------------------- formatting
function wrap(text, indent = '') {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if ((indent + candidate).length > WIDTH && line) { lines.push(indent + line); line = w; } else { line = candidate; }
  }
  if (line) lines.push(indent + line);
  return lines.join('\n');
}

function bullets(items) {
  return items.map((i) => wrap(i, '  ').replace(/^ {2}/, '- ')).join('\n');
}

function slug(title) {
  return title.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ------------------------------------------------------------------- editing
function indexBounds(lines, heading) {
  const start = lines.findIndex((l) => l === heading);
  if (start === -1) throw new Error(`heading not found: ${heading}`);
  const end = lines.findIndex((l, i) => i > start && l === '---');
  return [start, end === -1 ? lines.length : end];
}

function insertIntoGroup(lines, from, to, group, entry) {
  const g = lines.findIndex((l, i) => i >= from && i < to && l === `**${group}**`);
  if (g === -1) throw new Error(`group not found in index: ${group}`);
  let last = g;
  for (let i = g + 1; i < to; i += 1) {
    if (/^\d+\. /.test(lines[i])) last = i;
    else if (lines[i].startsWith('**')) break;
  }
  lines.splice(last + 1, 0, entry);
  return lines;
}

function insertBody(body, beforeHeading, block) {
  const at = body.indexOf(beforeHeading);
  if (at === -1) throw new Error(`heading not found: ${beforeHeading}`);
  return body.slice(0, at) + block + body.slice(at);
}

function appendShort(body, heading, clause) {
  const at = body.indexOf(heading);
  if (at === -1) throw new Error(`heading not found: ${heading}`);
  const head = body.slice(0, at + heading.length);
  let tail = body.slice(at + heading.length);
  const para = tail.replace(/^\s*\n/, '');
  const text = para.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  return `${head}\n\n${wrap(`${text} · ${clause.replace(/\.$/, '')}.`)}\n`;
}

function patternBlock(n, title, symptom, cases, rule, check, labels) {
  return [
    `## ${n}. ${title}`,
    '',
    wrap(`**${labels.symptom}.** ${symptom}`),
    '',
    `**${labels.cases}.**`,
    '',
    bullets(cases),
    '',
    wrap(`**${labels.rule}.** ${rule}`),
    '',
    `**${labels.check}.**`,
    '',
    bullets(check),
    '',
    '---',
    '',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------- main
function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const push = args.includes('--push');
  const dry = args.includes('--dry');
  if (!file) { console.error('usage: node tools/add-pattern.js <proposal.json> [--push] [--dry]'); process.exit(2); }

  const proposal = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errs = validate(proposal);
  if (errs.length) {
    errs.forEach((e) => console.log(e));
    console.log(`REJECTED  ${errs.length} violation(s); nothing was written`);
    process.exit(1);
  }
  console.log('ok    proposal passes every gate');

  const before = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, fs.readFileSync(f, 'utf8')]));
  const nums = [...before.en.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]));
  const N = Math.max(...nums) + 1;
  console.log(`info  writing pattern ${N}`);

  // The PT group label sits at the same position in the PT index as the EN one.
  const groupsOf = (body) => (body.split(/^## /m)[1].match(/^\*\*(.+?)\*\*$/gm) || []).map((l) => l.replace(/\*\*/g, ''));
  const gi = groupsOf(before.en).indexOf(proposal.group);
  const groupPt = groupsOf(before.pt)[gi];

  const next = { ...before };

  // English
  {
    const lines = next.en.split('\n');
    const [from, to] = indexBounds(lines, '## Index');
    insertIntoGroup(lines, from, to, proposal.group,
      `${N}. [${proposal.title_en}](#${N}-${slug(proposal.title_en)})`);
    let body = lines.join('\n');
    body = insertBody(body, '## The short version', patternBlock(
      N, proposal.title_en, proposal.symptom_en, proposal.cases_en, proposal.rule_en, proposal.check_en,
      { symptom: 'Symptom', cases: proposal.cases_en.length > 1 ? 'Cases' : 'Case', rule: 'Rule', check: 'How to check' },
    ));
    body = appendShort(body, '## The short version', proposal.short_en);
    body = body.replace(/^\d+ patterns,/m, `${N} patterns,`);
    next.en = body;
  }

  // Portuguese
  {
    const lines = next.pt.split('\n');
    const [from, to] = indexBounds(lines, '## Índice');
    insertIntoGroup(lines, from, to, groupPt,
      `${N}. [${proposal.title_pt}](#${N}-${slug(proposal.title_pt)})`);
    let body = lines.join('\n');
    body = insertBody(body, '## A versão curta', patternBlock(
      N, proposal.title_pt, proposal.symptom_pt, proposal.cases_pt, proposal.rule_pt, proposal.check_pt,
      { symptom: 'Sintoma', cases: proposal.cases_pt.length > 1 ? 'Casos' : 'Caso', rule: 'Regra', check: 'Como checar' },
    ));
    body = appendShort(body, '## A versão curta', proposal.short_pt);
    body = body.replace(/^\d+ padrões,/m, `${N} padrões,`);
    next.pt = body;
  }

  // README
  {
    const lines = next.readme.split('\n');
    const start = lines.findIndex((l) => l === '## The patterns');
    const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
    insertIntoGroup(lines, start, end, proposal.group, `${N}. ${proposal.title_en}`);
    next.readme = lines.join('\n').replace(/^\d+ verification patterns/m, `${N} verification patterns`);
  }

  if (dry) {
    console.log('info  --dry: nothing written');
    process.exit(0);
  }

  for (const [k, f] of Object.entries(FILES)) fs.writeFileSync(f, next[k]);

  // The gate decides whether the write survives. Pattern 14: a green suite does
  // not prove the gate runs, so it runs here, on the files as just written.
  try {
    const out = execFileSync('sh', ['check.sh'], { cwd: ROOT, encoding: 'utf8' });
    console.log(out.trim().split('\n').slice(-1)[0]);
  } catch (e) {
    console.log((e.stdout || '').trim());
    for (const [k, f] of Object.entries(FILES)) fs.writeFileSync(f, before[k]);
    console.log('FAILED  check.sh rejected the result; the files were restored');
    process.exit(1);
  }

  console.log(`ok    pattern ${N} written to all three files`);

  if (push) {
    const msg = `pattern ${N}: ${proposal.title_en}\n\n`
      + `Added by tools/add-pattern.js from a session lesson. Gates: `
      + `tools/gate-proposal.js, then check.sh on the written files.\n\n`
      + `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>\n`;
    execFileSync('git', ['add', 'PATTERNS.md', 'PATTERNS.pt-BR.md', 'README.md'], { cwd: ROOT });
    execFileSync('git', ['commit', '-m', msg], { cwd: ROOT, stdio: 'inherit' });
    execFileSync('git', ['push', 'origin', 'HEAD'], { cwd: ROOT, stdio: 'inherit' });
    console.log('ok    committed and pushed');
  } else {
    console.log('info  not committed (pass --push)');
  }
}

main();
