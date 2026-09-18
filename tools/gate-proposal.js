#!/usr/bin/env node
'use strict';
// Gates a candidate pattern before a single byte is written to the guide.
//
// This repository is public and the writer is an agent closing a session, so
// the review has to be mechanical: every rule below is an assertion with a code
// and a stated expectation, and each one has a negative test in
// tools/test-gates.sh that fails for the reason claimed (pattern 8).
//
// Usage:  node tools/gate-proposal.js proposal.json
//         exit 0 = the proposal may be written, 1 = rejected (reasons on stdout)

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EN = path.join(ROOT, 'PATTERNS.md');
const PT = path.join(ROOT, 'PATTERNS.pt-BR.md');

// --------------------------------------------------------------------- shapes
// The same shapes check.sh keeps out of the committed files. They are repeated
// here on purpose: check.sh is the gate on what is in the repository, this is
// the gate on what is about to enter it, and a proposal that only fails at
// commit time has already cost a rollback.
const FORBIDDEN = [
  ['E_ANON', 'local path', /[A-Za-z]:\\|\/Users\/|\/home\/[a-z]/],
  ['E_ANON', 'email address', /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ['E_ANON', 'record id', /\b(app|tbl|rec|fld)[A-Za-z0-9]{14}\b/],
  ['E_ANON', 'wiki link', /\[\[/],
  ['E_ANON', 'url', /https?:\/\//],
  ['E_PRODUCT', 'product name', /(^|[^A-Za-z])(GitHub|GitLab|Airtable|Netlify|Supabase|Obsidian|Claude|Anthropic|OpenAI|ChatGPT|Upwork|Twilio|Playwright|Slack|Notion|Vercel|Cloudflare)([^A-Za-z]|$)/],
  ['E_PRIVATE', 'own brand or person', /(^|[^A-Za-z])(Nord ?Leads|NordVask|Brum|Chosen|Kurata|Nathalia|Grosetti|Vitor)([^A-Za-z]|$)/i],
  ['E_EMDASH', 'em dash', /—/],
  // Special-category signals. Literal anonymization is the floor; what leaks is
  // reidentification by combination, which no regex catches. These words are
  // the ones that mean the case came from someone's personal data, and none of
  // them appears in the current corpus, so a hit is a new case, not a false
  // positive on existing prose.
  ['E_SENSITIVE', 'special-category signal',
    /(^|[^A-Za-z])(patient|biometric|GDPR|Art\.? ?9|medical record|diagnosis|prontuário|biométric\w*|paciente|diagnóstico|menor de idade|dado sensível|categoria especial)([^A-Za-z]|$)/i],
];

// Where the case came from. The rule this encodes: material derived from client
// work does not enter a public repository of ours, even anonymized, when it
// involves a privacy incident, special-category data, or a combination that
// reidentifies. The lesson stays, the case goes.
const ORIGINS = ['own-tooling', 'own-site', 'research'];

const PROVENANCE_EN = /\((measured|reported|inferred)\)/;
const PROVENANCE_PT = /\((medido|dito|inferido)\)/;

const FIELDS = {
  origin: 'string',
  group: 'string',
  title_en: 'string', title_pt: 'string',
  symptom_en: 'string', symptom_pt: 'string',
  cases_en: 'array', cases_pt: 'array',
  rule_en: 'string', rule_pt: 'string',
  check_en: 'array', check_pt: 'array',
  short_en: 'string', short_pt: 'string',
};

const SIZES = {
  title_en: [10, 110], title_pt: [10, 110],
  symptom_en: [30, 400], symptom_pt: [30, 400],
  rule_en: [30, 400], rule_pt: [30, 400],
  short_en: [20, 240], short_pt: [20, 240],
};

// ---------------------------------------------------------------- the corpus
function readGroups(file) {
  // Group labels, in document order, as they appear in the index.
  const body = fs.readFileSync(file, 'utf8');
  const index = body.split(/^## /m)[1] || '';
  return (index.match(/^\*\*(.+?)\*\*$/gm) || []).map((l) => l.replace(/\*\*/g, ''));
}

function readExisting(file) {
  const body = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /^## (\d+)\. (.+)$/gm;
  let m;
  while ((m = re.exec(body))) out.push({ n: Number(m[1]), title: m[2] });
  return out;
}

function readRules(file) {
  // The whole rule, not its first line: rules wrap over several lines, and a
  // one-line read makes every long rule look short and stops the overlap check
  // from seeing the words that matter.
  const body = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /^\*\*(?:Rule|Regra)\.\*\* ([\s\S]*?)\n\n/gm;
  let m;
  while ((m = re.exec(body))) out.push(m[1].replace(/\s+/g, ' ').trim());
  return out;
}

// ------------------------------------------------------------------ duplicate
const STOP = new Set(('a an the is are not no of to in on for that which what and or but it its'
  + ' um uma o a os as e ou de do da em no na para que nao não e é').split(/\s+/));

function tokens(s) {
  return new Set(String(s).toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w)));
}

function containment(a, b) {
  // How much of the smaller vocabulary the larger one already contains.
  const A = tokens(a); const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / Math.min(A.size, B.size);
}

function jaccard(a, b) {
  const A = tokens(a); const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / (A.size + B.size - inter);
}

// ----------------------------------------------------------------- validation
function validate(p) {
  const errs = [];
  const err = (code, msg) => errs.push(`${code}  ${msg}`);

  // 1. Every field present, of the right kind, non-empty.
  for (const [field, kind] of Object.entries(FIELDS)) {
    const v = p[field];
    if (kind === 'array') {
      if (!Array.isArray(v) || v.length === 0) { err('E_FIELD', `${field} must be a non-empty array`); continue; }
      if (v.some((x) => typeof x !== 'string' || !x.trim())) err('E_FIELD', `${field} has an empty entry`);
    } else if (typeof v !== 'string' || !v.trim()) {
      err('E_FIELD', `${field} must be a non-empty string`);
    }
  }
  if (errs.length) return errs; // nothing below can be trusted without the fields

  // 2. Where the case came from, declared. A declaration is not proof
  //    (pattern 18), which is why the special-category regex runs as well, but
  //    it forces the question to be asked before the case is written down.
  if (!ORIGINS.includes(p.origin)) {
    err('E_CLIENT', `origin "${p.origin}" is not one of: ${ORIGINS.join(' | ')}. A case from client work does not enter this repository, anonymized or not; keep the lesson, drop the case`);
  }

  // 3. The group has to be one the index already carries.
  const groupsEn = readGroups(EN);
  const groupsPt = readGroups(PT);
  const gi = groupsEn.indexOf(p.group);
  if (gi === -1) err('E_GROUP', `group "${p.group}" is not one of: ${groupsEn.join(' | ')}`);
  if (gi !== -1 && !groupsPt[gi]) err('E_GROUP', `group "${p.group}" has no counterpart in ${path.basename(PT)}`);

  // 3. The two languages must carry the same material, not a summary of it.
  if (p.cases_en.length !== p.cases_pt.length) {
    err('E_PARITY', `cases: ${p.cases_en.length} in EN, ${p.cases_pt.length} in PT`);
  }
  if (p.check_en.length !== p.check_pt.length) {
    err('E_PARITY', `how to check: ${p.check_en.length} in EN, ${p.check_pt.length} in PT`);
  }

  // 4. A case with a number states where the number came from. A case with no
  //    number says so out loud, in the proposal, so the omission is a decision.
  const casesEn = p.cases_en.join('\n');
  const casesPt = p.cases_pt.join('\n');
  const hasDigit = /\d/.test(casesEn) || /\d/.test(casesPt);
  if (!p.no_number_reason) {
    if (!PROVENANCE_EN.test(casesEn)) err('E_PROVENANCE', 'no (measured|reported|inferred) mark in cases_en, and no no_number_reason');
    if (!PROVENANCE_PT.test(casesPt)) err('E_PROVENANCE', 'no (medido|dito|inferido) mark in cases_pt, and no no_number_reason');
  } else if (hasDigit && !PROVENANCE_EN.test(casesEn) && !PROVENANCE_PT.test(casesPt)) {
    err('E_PROVENANCE', 'no_number_reason is set but the cases carry numbers with no provenance mark');
  }

  // 5. Shapes that must never reach a public repository.
  const all = [p.group, p.title_en, p.title_pt, p.symptom_en, p.symptom_pt, p.rule_en, p.rule_pt,
    p.short_en, p.short_pt, casesEn, casesPt, p.check_en.join('\n'), p.check_pt.join('\n'),
    p.no_number_reason || ''].join('\n');
  for (const [code, label, re] of FORBIDDEN) {
    const m = all.match(re);
    if (m) err(code, `${label} in the proposal: ${JSON.stringify(m[0].slice(0, 60))}`);
  }

  // 6. Sizes. A one-line case is an assertion, not a case; a page is an essay.
  for (const [field, [min, max]] of Object.entries(SIZES)) {
    const len = p[field].trim().length;
    if (len < min || len > max) err('E_SIZE', `${field} is ${len} chars, expected ${min}..${max}`);
  }
  for (const [field, [min, max]] of [['cases_en', [60, 1400]], ['cases_pt', [60, 1400]]]) {
    p[field].forEach((c, i) => {
      if (c.trim().length < min || c.trim().length > max) {
        err('E_SIZE', `${field}[${i}] is ${c.trim().length} chars, expected ${min}..${max}`);
      }
    });
  }
  for (const field of ['title_en', 'title_pt']) {
    if (/\.$/.test(p[field].trim())) err('E_SIZE', `${field} must not end in a full stop`);
  }

  // 7. Not something the guide already says. Title or rule too close to an
  //    existing one means the lesson belongs inside that pattern, not beside it.
  const existing = readExisting(EN);
  const rules = readRules(EN);
  for (const e of existing) {
    if (e.title.toLowerCase() === p.title_en.trim().toLowerCase()) {
      err('E_DUP', `title_en is identical to pattern ${e.n}`);
    } else if (jaccard(e.title, p.title_en) > 0.55) {
      err('E_DUP', `title_en overlaps pattern ${e.n} ("${e.title}")`);
    }
  }
  // Rules are compared by containment, not by Jaccard: a reworded rule that
  // keeps most of an existing rule's vocabulary but adds a sentence would score
  // low on Jaccard and is exactly the duplicate worth catching.
  rules.forEach((r, i) => {
    if (containment(r, p.rule_en) > 0.65) err('E_DUP', `rule_en overlaps the rule of pattern ${i + 1}`);
  });

  return errs;
}

module.exports = { validate, readGroups, readExisting, readRules, jaccard, containment };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node tools/gate-proposal.js <proposal.json>'); process.exit(2); }
  let proposal;
  try {
    proposal = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`E_JSON  ${file}: ${e.message}`);
    console.log('REJECTED');
    process.exit(1);
  }
  const errs = validate(proposal);
  if (errs.length) {
    errs.forEach((e) => console.log(e));
    console.log(`REJECTED  ${errs.length} violation(s)`);
    process.exit(1);
  }
  console.log(`ok    proposal "${proposal.title_en}" passes every gate`);
  process.exit(0);
}
