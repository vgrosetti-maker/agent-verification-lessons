#!/bin/sh
# Sanity gate for this repository. Every check is a positive assertion with a
# stated expectation, and the script exits non-zero on the first violation.
# Pattern 15 of PATTERNS.md is the reason this file exists.
set -u
fail=0
EN=PATTERNS.md
PT=PATTERNS.pt-BR.md

expect_count() { # label file pattern expected
  got=$(grep -cE "$3" "$2" || true)
  if [ "$got" != "$4" ]; then
    echo "FAIL  $1: expected $4 in $2, found $got"
    fail=1
  else
    echo "ok    $1: $got in $2"
  fi
}

expect_absent() { # label pattern
  hits=$(grep -rnE "$2" README.md "$EN" "$PT" LICENSE || true)
  if [ -n "$hits" ]; then
    echo "FAIL  $1:"
    echo "$hits" | sed 's/^/        /'
    fail=1
  else
    echo "ok    $1: absent"
  fi
}

# The documents must keep the same number of patterns in both languages.
expect_count "patterns EN" "$EN" '^## [0-9]+\.' 22
expect_count "patterns PT" "$PT" '^## [0-9]+\.' 22

# Anonymization: shapes that must never reach a public repository.
expect_absent "local paths"      '[A-Za-z]:\\|/Users/|/home/[a-z]'
expect_absent "email addresses"  '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
expect_absent "record ids"       '\b(app|tbl|rec|fld)[A-Za-z0-9]{14}\b'
expect_absent "wiki links"       '\[\[' 

# House style: the em dash is an AI writing tell and is not used here.
expect_absent "em dash"          '—'

# Every case that carries a number must carry where the number came from.
for f in "$EN" "$PT"; do
  marks=$(grep -cE '\((measured|reported|inferred|medido|relatado|inferido)\)' "$f" || true)
  if [ "$marks" -lt 20 ]; then
    echo "FAIL  provenance: only $marks marked numbers in $f"
    fail=1
  else
    echo "ok    provenance: $marks marked numbers in $f"
  fi
done

# Every entry in the index must point at a heading that exists, in both files.
for f in "$EN" "$PT"; do
  entries=$(grep -cE '^[0-9]+\.' "$f" || true)
  if [ "$entries" != 22 ]; then
    echo "FAIL  index: $entries entries in $f, expected 22"
    fail=1
    continue
  fi
  missing=0
  for n in $(grep -oE '^[0-9]+\.' "$f" | tr -d '.'); do
    grep -qE "^## $n\. " "$f" || { echo "FAIL  index: entry $n has no heading in $f"; missing=1; }
  done
  if [ "$missing" = 0 ]; then
    echo "ok    index: all $entries entries resolve to a heading in $f"
  else
    fail=1
  fi
done

if [ "$fail" = 0 ]; then
  echo "PASS"
else
  echo "FAILED"
fi
exit $fail
