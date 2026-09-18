# tools

How a new pattern gets into the guide without a human rereading 2,700 lines of Markdown first.

The guide is fed by sessions: a piece of work ends, a lesson survives it, and that lesson is
written here as a pattern. The writer is usually an agent, the repository is public, and the
material is the kind that is wrong in ways that still look fine. So the review is mechanical.

```
lesson  ->  proposal.json  ->  gate-proposal.js  ->  add-pattern.js  ->  check.sh  ->  commit
                                  (rejects)            (writes)         (rejects, restores)
```

## The proposal

A single JSON file. `tools/fixtures/example-proposal.json` is a working one.

| Field | Meaning |
|---|---|
| `group` | One of the group labels already in the index of `PATTERNS.md` (`Gates`, `Detectors`, ...). The Portuguese label is taken from the same position in the Portuguese index. |
| `title_en`, `title_pt` | The heading. No full stop at the end. |
| `symptom_en`, `symptom_pt` | What it looks like from the outside, usually reassuring. |
| `cases_en`, `cases_pt` | One entry per real case. Same number of entries in both languages. |
| `rule_en`, `rule_pt` | The one sentence worth remembering. |
| `check_en`, `check_pt` | The command, control or ordering that catches it. Same number of entries in both. |
| `short_en`, `short_pt` | The clause appended to "The short version" at the foot of each file. |
| `no_number_reason` | Optional. Required when the cases carry no `(measured)` / `(medido)` mark, and it says why. |

## The gates

`node tools/gate-proposal.js proposal.json` runs before anything is written. Each rejection
carries a code, and each code has a negative test in `tools/test-gates.js` that fails for that
reason and no other.

| Code | Rejects |
|---|---|
| `E_FIELD` | A field missing, empty, or of the wrong kind. |
| `E_GROUP` | A group that is not already in the index, in both languages. |
| `E_PARITY` | A different number of cases or checks between the two languages. |
| `E_PROVENANCE` | A case with no `(measured\|reported\|inferred)` mark and no `no_number_reason`. |
| `E_ANON` | A local path, an email address, a record id, a wiki link or a URL. |
| `E_PRODUCT` | A vendor or product name. Cases here say "a CLI listing issues", not who made it. |
| `E_PRIVATE` | A brand or person from the author's own work. |
| `E_EMDASH` | An em dash, which this repository does not use. |
| `E_SIZE` | A title, symptom, rule, case or clause outside its length band. |
| `E_DUP` | A title or rule that overlaps one already in the guide. The lesson belongs inside that pattern. |

## The write

`node tools/add-pattern.js proposal.json [--push]` writes the pattern as **N+1** in both
languages, adds the index entry under its group, adds the README entry, updates the stated count
in all three files, and appends the clause to "The short version".

Numbering is append-only. "Pattern 14" is an address that briefings and other documents already
point at, so a new pattern never renumbers an old one, even when its group sits higher up.

After writing, `add-pattern.js` runs `check.sh` on the result. If the gate rejects, the three
files are restored to their previous contents and nothing is committed. With `--push` and a green
gate, it commits and pushes.

## The tests

`node tools/test-gates.js` runs a positive control, one negative test per rejection code, and an
end-to-end write against a copy of the repository in a temp directory: it asserts the heading,
both index entries, the README entry, the three stated counts, the short-version clause, that
`check.sh` accepts the result, and that proposing the same lesson a second time is rejected as a
duplicate. It runs in CI beside `check.sh`.
