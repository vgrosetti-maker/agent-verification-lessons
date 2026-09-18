# Agent verification lessons

22 verification patterns, each one built from a real case where an AI agent reported
something that was not true, and the measurement that caught it.

- **[PATTERNS.md](PATTERNS.md)** - the guide, in English.
- **[PATTERNS.pt-BR.md](PATTERNS.pt-BR.md)** - the same substance in Brazilian Portuguese.

## What this is

Most advice about verifying agent work stops at "check the output". These patterns are narrower
and more useful than that: they are the specific ways a check can be green and wrong. A scheduled
job that exits 0 for 25 days without producing anything. A detector whose negative test passes
because the injected defect was never reached. A gate whose CI never runs it. A zero that means
the instrument was blocked, not that the world is empty.

Each pattern has the same four parts:

1. **Symptom** - what it looks like from the outside, usually reassuring.
2. **Case** - what actually happened, with the numbers the commands produced.
3. **Rule** - the one sentence worth remembering.
4. **How to check** - the command, control or ordering that would have caught it.

Numbers carry their provenance: `(measured)` came from a command, `(reported)` came from a person,
`(inferred)` was reconstructed afterwards. Cases with no measured number are written without one.

## Who it is for

People building or supervising AI agents: anyone writing subagent briefings, CI gates, detectors,
acceptance criteria, or evals. It is written for agent work but nothing in it is agent-specific,
because the failure modes are the ordinary failure modes of measurement, made faster and cheaper
to produce.

It is not a tool, a framework or a checklist to run. It is a catalogue of ways to be wrong
confidently.

## How to use it

- **Before trusting a green.** Find the pattern that matches the shape of your check and run its
  "how to check" line.
- **While writing a detector or a gate.** Patterns 7 through 16 are the ones that will bite.
- **When briefing an agent.** Patterns 17 through 19 cover what happens when numbers, artifacts
  and second-hand claims travel between sessions.
- **When an alarm surprises you.** Patterns 20 and 21, in that order.
- **As agent-readable context.** The file is plain Markdown with stable headings; pointing an
  agent at a specific pattern works better than pasting the whole thing.

## The patterns

**Reading absence**

1. Empty is not absence
2. A zero that confirms you is the most expensive zero
3. A positive control proves the instrument finds, not that it finds the failing class

**What green means**

4. Exit 0 proves termination, not work
5. Smoke proves response; dry-run proves the dry path
6. A signal proves execution only if it could not exist without it

**Detectors**

7. A detector that never accused anything is not evidence of health
8. The negative test must fail for the reason you claim
9. Measure effect, not declaration
10. The ruler must not live inside the system being measured
11. A detector's count is not a work queue
12. Synthetic fixtures do not carry the real material's pathologies
13. The process loads the installed copy, not your edit

**Gates**

14. A green suite does not prove the gate runs
15. A gate is a positive assertion, never the absence of the forbidden
16. An aborted suite is a blind gate, and red lies too

**Numbers and claims**

17. A number without its instrument is testimony
18. Declared is not done
19. Second-hand facts, and sources that expired

**Before you blame the target**

20. Suspect your own instrument first
21. Run the command that answers *that* question

**Before you measure at all**

22. Ask what success means before optimizing

## Where the cases come from

They come from anonymized logs of real work with agents. Names, clients, paths, identifiers and
anything that would tie a case to a particular party have been removed. The numbers that remain
were not adjusted, and where a case had no measured number, or where the number itself would point
at a party, it is written without one.

Contributions of the same shape are welcome: symptom, real case with its numbers, rule, how to
check. A pattern with no real case does not belong here. Contributions are accepted under the
same license as the rest of this material: what comes in goes out under CC BY 4.0.

New patterns are written through [tools/](tools/README.md): a proposal file goes through a set of
gates (provenance, anonymization, duplication, parity between the two languages) before a byte is
written, and `check.sh` decides whether the write survives. That is also how the guide grows from
the sessions that produce the lessons in the first place.

## License

[CC BY 4.0](LICENSE) - Creative Commons Attribution 4.0 International. Copyright (c) 2026 Vitor
Grosetti.
