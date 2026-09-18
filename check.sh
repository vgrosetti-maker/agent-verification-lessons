#!/bin/sh
# Sanity gate for this repository. Every check is a positive assertion with a
# stated expectation, and the script exits non-zero when one is violated.
# Pattern 15 of PATTERNS.md is the reason this file exists.
#
# Nothing here is hardcoded to the current number of patterns: N is read from
# the documents, and every other count is asserted against it. A gate whose
# expectation has to be edited by hand every time the material grows is a gate
# that will be edited into agreement with whatever is there (pattern 9).
set -u
fail=0
EN=PATTERNS.md
PT=PATTERNS.pt-BR.md
RM=README.md

ok()   { echo "ok    $1"; }
bad()  { echo "FAIL  $1"; fail=1; }

expect_count() { # label file pattern expected
  got=$(grep -cE "$3" "$2" || true)
  if [ "$got" != "$4" ]; then
    bad "$1: expected $4 in $2, found $got"
  else
    ok "$1: $got in $2"
  fi
}

expect_absent() { # label pattern
  hits=$(grep -rnE "$2" "$RM" "$EN" "$PT" LICENSE || true)
  if [ -n "$hits" ]; then
    bad "$1:"
    echo "$hits" | sed 's/^/        /'
  else
    ok "$1: absent"
  fi
}

# ---------------------------------------------------------------- the number N
# N is the highest numbered heading in the English file. Everything else is
# measured against it.
N=$(grep -oE '^## [0-9]+\.' "$EN" | tr -cd '0-9\n' | sort -n | tail -1)
if [ -z "$N" ]; then
  echo "FAIL  N: no numbered heading in $EN"
  echo "FAILED"
  exit 1
fi
echo "info  N = $N (highest numbered heading in $EN)"

# ------------------------------------------------------------------- headings
# Both languages carry the same N patterns, numbered 1..N with no gap and no
# duplicate. A missing number would otherwise show up only as a broken link.
for f in "$EN" "$PT"; do
  expect_count "headings" "$f" '^## [0-9]+\.' "$N"
  gaps=""
  n=1
  while [ "$n" -le "$N" ]; do
    hits=$(grep -cE "^## $n\. " "$f" || true)
    [ "$hits" = 1 ] || gaps="$gaps $n($hits)"
    n=$((n + 1))
  done
  if [ -n "$gaps" ]; then
    bad "numbering in $f: each of 1..$N must appear once, got:$gaps"
  else
    ok "numbering in $f: 1..$N, one heading each"
  fi
done

# ---------------------------------------------------------------- index parity
# Every entry in the index must point at a heading that exists, in both files.
for f in "$EN" "$PT"; do
  entries=$(grep -cE '^[0-9]+\.' "$f" || true)
  if [ "$entries" != "$N" ]; then
    bad "index: $entries entries in $f, expected $N"
    continue
  fi
  missing=0
  for n in $(grep -oE '^[0-9]+\.' "$f" | tr -d '.'); do
    grep -qE "^## $n\. " "$f" || { bad "index: entry $n has no heading in $f"; missing=1; }
  done
  [ "$missing" = 0 ] && ok "index: all $entries entries resolve to a heading in $f"
done

# ------------------------------------------------------------------- structure
# Every pattern carries the same four parts, in both languages. A pattern with
# no "how to check" is a complaint, not a pattern.
for f in "$EN" "$PT"; do
  out=$(awk -v file="$f" '
    function flush(   miss) {
      if (n == "") return
      miss = ""
      if (!sym) miss = miss " symptom"
      if (!cas) miss = miss " case"
      if (!rul) miss = miss " rule"
      if (!chk) miss = miss " how-to-check"
      if (miss != "") printf "pattern %s missing:%s\n", n, miss
    }
    /^## [0-9]+\. /              { flush(); n = $2; sub(/\./, "", n); sym = cas = rul = chk = 0; next }
    /^## /                       { flush(); n = ""; next }
    /^\*\*(Symptom|Sintoma)\.\*\*/        { sym = 1 }
    /^\*\*(Cases?|Casos?)\.\*\*/          { cas = 1 }
    /^\*\*(Rule|Regra)\.\*\*/             { rul = 1 }
    /^\*\*(How to check|Como checar)\.\*\*/ { chk = 1 }
    END { flush() }
  ' "$f")
  if [ -n "$out" ]; then
    bad "structure in $f:"
    echo "$out" | sed 's/^/        /'
  else
    ok "structure in $f: all $N patterns carry symptom, case, rule, how to check"
  fi
done

# ------------------------------------------------------- the README agrees too
# The README repeats the list of patterns. A README that lags the guide is the
# first thing a reader sees and the last thing anyone updates.
listed=$(awk '/^## The patterns$/ { inlist = 1; next } /^## / { inlist = 0 } inlist && /^[0-9]+\. /' "$RM")
count=$(echo "$listed" | grep -cE '^[0-9]+\. ' || true)
if [ "$count" != "$N" ]; then
  bad "README list: expected $N entries under '## The patterns', found $count"
else
  ok "README list: $count entries"
fi
miss=0
n=1
while [ "$n" -le "$N" ]; do
  echo "$listed" | grep -qE "^$n\. " || { bad "README list: entry $n is missing"; miss=1; }
  n=$((n + 1))
done
[ "$miss" = 0 ] && ok "README list: entries 1..$N present"

# The stated count, in all three places that state it.
grep -qE "^$N patterns," "$EN"            && ok "stated count in $EN: $N"  || bad "stated count in $EN is not $N"
grep -qE "^$N padrões," "$PT"             && ok "stated count in $PT: $N"  || bad "stated count in $PT is not $N"
grep -qE "^$N verification patterns" "$RM" && ok "stated count in $RM: $N" || bad "stated count in $RM is not $N"

# --------------------------------------------------------------- anonymization
# Shapes that must never reach a public repository.
expect_absent "local paths"      '[A-Za-z]:\\|/Users/|/home/[a-z]'
expect_absent "email addresses"  '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
expect_absent "record ids"       '\b(app|tbl|rec|fld)[A-Za-z0-9]{14}\b'
expect_absent "wiki links"       '\[\['

# Cases are written without naming the product they happened in: "a CLI listing
# issues", not the vendor. Measured at the time this check was added: 0 hits for
# all of the names below.
expect_absent "product names"    '(^|[^A-Za-z])(GitHub|GitLab|Airtable|Netlify|Supabase|Obsidian|Claude|Anthropic|OpenAI|ChatGPT|Upwork|Twilio|Playwright|Slack|Notion|Vercel|Cloudflare)([^A-Za-z]|$)'

# House style: the em dash is an AI writing tell and is not used here.
expect_absent "em dash"          '—'

# ----------------------------------------------------------------- provenance
# Every case that carries a number must carry where the number came from. At
# least one marked number per pattern, on average, in each language.
for f in "$EN" "$PT"; do
  marks=$(grep -cE '\((measured|reported|inferred|medido|dito|inferido)\)' "$f" || true)
  if [ "$marks" -lt "$N" ]; then
    bad "provenance: only $marks marked numbers in $f, expected at least $N"
  else
    ok "provenance: $marks marked numbers in $f"
  fi
done

if [ "$fail" = 0 ]; then
  echo "PASS"
else
  echo "FAILED"
fi
exit $fail
