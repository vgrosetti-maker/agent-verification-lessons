# Verification patterns

26 patterns, each in the same shape: **symptom → real case → rule → how to check**.

Every case below comes from anonymized logs of real work with AI agents. Names of brands,
clients and local paths are removed; the numbers are not. Each case carries its provenance:

- **(measured)** - a number a command produced, recorded at the time.
- **(reported)** - someone said it; nobody re-ran the command.
- **(inferred)** - reconstructed after the fact, not measured.

Cases with no measured number are written without one. Nothing here was rounded up to look
better.

---

## Index

**Reading absence**

1. [Empty is not absence](#1-empty-is-not-absence)
2. [A zero that confirms you is the most expensive zero](#2-a-zero-that-confirms-you-is-the-most-expensive-zero)
3. [A positive control proves the instrument finds, not that it finds the failing class](#3-a-positive-control-proves-the-instrument-finds-not-that-it-finds-the-failing-class)

**What green means**

4. [Exit 0 proves termination, not work](#4-exit-0-proves-termination-not-work)
5. [Smoke proves response; dry-run proves the dry path](#5-smoke-proves-response-dry-run-proves-the-dry-path)
6. [A signal proves execution only if it could not exist without it](#6-a-signal-proves-execution-only-if-it-could-not-exist-without-it)
23. [A clean merge is not a correct merge](#23-a-clean-merge-is-not-a-correct-merge)

**Detectors**

7. [A detector that never accused anything is not evidence of health](#7-a-detector-that-never-accused-anything-is-not-evidence-of-health)
8. [The negative test must fail for the reason you claim](#8-the-negative-test-must-fail-for-the-reason-you-claim)
9. [Measure effect, not declaration](#9-measure-effect-not-declaration)
10. [The ruler must not live inside the system being measured](#10-the-ruler-must-not-live-inside-the-system-being-measured)
11. [A detector's count is not a work queue](#11-a-detectors-count-is-not-a-work-queue)
12. [Synthetic fixtures do not carry the real material's pathologies](#12-synthetic-fixtures-do-not-carry-the-real-materials-pathologies)
13. [The process loads the installed copy, not your edit](#13-the-process-loads-the-installed-copy-not-your-edit)

**Gates**

14. [A green suite does not prove the gate runs](#14-a-green-suite-does-not-prove-the-gate-runs)
15. [A gate is a positive assertion, never the absence of the forbidden](#15-a-gate-is-a-positive-assertion-never-the-absence-of-the-forbidden)
16. [An aborted suite is a blind gate, and red lies too](#16-an-aborted-suite-is-a-blind-gate-and-red-lies-too)
24. [The adapter fabricates the zero the instrument never measured](#24-the-adapter-fabricates-the-zero-the-instrument-never-measured)
26. [The detector already collects the field and only lacks the verdict](#26-the-detector-already-collects-the-field-and-only-lacks-the-verdict)

**Numbers and claims**

17. [A number without its instrument is testimony](#17-a-number-without-its-instrument-is-testimony)
18. [Declared is not done](#18-declared-is-not-done)
19. [Second-hand facts, and sources that expired](#19-second-hand-facts-and-sources-that-expired)
25. [A mechanism that fits the delta is not the cause of the delta](#25-a-mechanism-that-fits-the-delta-is-not-the-cause-of-the-delta)

**Before you blame the target**

20. [Suspect your own instrument first](#20-suspect-your-own-instrument-first)
21. [Run the command that answers *that* question](#21-run-the-command-that-answers-that-question)

**Before you measure at all**

22. [Ask what success means before optimizing](#22-ask-what-success-means-before-optimizing)

---

## 1. Empty is not absence

**Symptom.** A command returns nothing, exits clean, and the agent writes "there is no X".

**Cases.**

- An inventory command for scheduled tasks returned **0 lines**, no error, no bad exit code.
  The machine had **17 scheduled tasks**, one of them running daily for months (measured).
  The command did not exist in that shell and returned nothing instead of failing.
- A marketplace search returned "zero jobs in this niche". It became a business verdict  - 
  stop spending credits, take the portfolio down - and stood for **6 days**. Re-measured
  with a working route, the same niche had **62 / 23 / 910 / 266** jobs (measured). The
  search had never executed: the CDN returned 403 before anything rendered.
- A CLI listing issues reported "30 open" twice. The real number was **38** (measured);
  that CLI caps at 30 items per page by default, silently.
- A DNS query for a DKIM record on the wrong sub-name returned NXDOMAIN, and the agent
  reported "the domain is not authenticated". Authentication existed one label up, on the
  apex. Separately, the same record read NXDOMAIN on one large public resolver and correct
  on three others - negative caching from before the record was created (measured).
- A list endpoint returned **HTTP 200 with `[]`**, and the UI said "no workspaces". Asking
  for one known workspace by id returned **403 "API access is not enabled"** (measured). An
  empty collection swallowed a permission denial and returned it looking like an inventory.

**Rule.** Zero is the only result a broken instrument and an empty world produce identically.
Every other number invites suspicion; zero passes for an answer.

**How to check.**

- Run the same inventory through a second, independent path before "not found" becomes
  "does not exist".
- Or prove the instrument with a case that *must* appear.
- For any paginated CLI or API, pass an explicit limit and compare against the total the
  platform itself prints.
- For an empty authenticated collection, fetch one known item by id. `200 []` and `403` are
  different facts.
- An apparent inventory from a paginated UI is not an inventory. One listing page rendered 12
  cards at a time and the owner concluded a category did not exist on that site; the API the
  page itself calls returned **1,037 listings, 47 of them in that category** (measured).
- A decision resting on a zero inherits the date and the route of that zero. Route changed,
  decision reopens.
- The mirror image is worth the same attention: a **filled** field read as a validated one. In
  one contact database, records with nothing in the underlying field had an unrelated URL in the
  `website` column and the label "site OK", so the rows that most needed attention scored
  lowest. One record went from 42 to 67 when checked by hand, and the same pattern hit 9 rows
  (measured).

---

## 2. A zero that confirms you is the most expensive zero

**Symptom.** The empty result agrees with what you already believed, so nobody audits it.

**Case.** The question was whether a third party runs paid ads. Two public transparency tools
were queried. One returned **HTTP 403 with a JS challenge**; the other returned **HTTP 200
with the application shell and no rendered list** (measured). Both look exactly like "this
advertiser has no ads". There was also a second-hand claim in play - that this party's
growth is organic, not paid (reported). Reading the vacuum as absence would have **fabricated
the confirmation** of that claim, and it would have entered a decision as a measured fact.

**Rule.** A zero that contradicts your expectation raises suspicion on its own. A zero that
confirms it does not. Treat the confirming zero as the one that needs the second path.

**How to check.** Record every empty collection as one of two distinct things, in writing:

- **Vacuum of fact** - the tool answered: `no active ads found on <date>, queried at <URL>`.
- **Vacuum of instrument** - the tool refused: `the library refused the query (403, JS
  challenge) on <date>; not determinable by this session` **plus the line naming which
  instrument would resolve it** (real browser, authenticated session, the client's own
  analytics). Without that line the record only says it is old, not how to get out of the
  doubt.

A related reflex from the same effort: two subagents in a row reported not having browser
automation in their tool set although the briefing asked for it (measured). The second was
right to stop and declare the limit rather than repeat a plain HTTP call and return the same
empty result dressed as a finding. But "this agent lacks the tool" does not license "the
machine has no browser" - that is another absence claim needing its own check.

---

## 3. A positive control proves the instrument finds, not that it finds the failing class

**Symptom.** The probe was validated against a case you knew would show up, and it still
misses an entire category.

**Cases.**

- A lookup checked a public business directory **by one identifier the records carried**, and
  **19 of 22** lookups came back "no listing" (measured). That directory indexes a
  **different identifier**, not the one in hand. One record that clearly had a listing was
  reported absent. The same run only tested one country TLD, so a business advertising on a
  `.com` also became "absent". The positive controls all passed, because they happened to be
  leads whose key matched.
- A probe read `input[type=file].files.length === 0` and concluded an upload had failed. The
  file was attached; the framework clears the input after consuming the `File`. The available
  positive control - a thumbnail known to be present - returned `0` from the same probe and
  was never run.
- Three rounds of QA proved "0 occurrences of a forbidden string" in the build and on the live
  site, each with a valid positive control. The page kept serving that string to visitors: the
  text comes from a **catalog in the database**, not from a file in the repo. A grep over the
  build directory could never see it.

**Rule.** A positive control proves the instrument finds *something*. It does not prove it
finds the class that is currently failing. And a compliance gate that runs over the repository
is blind to content served by a database, an API or a CMS.

**How to check.** Before accepting absence at scale, ask **by which key the index is built**,
and whether that is the key you hold. Then test one case from the *suspect* class on purpose  - 
not one from the class you already trust. Before declaring a surface clean, enumerate where
each piece of public text comes from, and cover the dynamic sources by opening the screen or
calling the endpoint.

---

## 4. Exit 0 proves termination, not work

**Symptom.** A dashboard of green jobs, and no artifact anywhere.

**Cases.**

- A scheduled job ran daily at 08:30 with a success result code for **25 days**. Its script
  hit `if today > END_OF_PILOT: print(...); return` - a bare return, so exit 0. The most
  recent artifact on disk was from four weeks earlier (measured). Twenty-five days of empty
  success.
- A reader written as `existsSync(path) ? read(path) : ''` printed a well-formed report  - 
  `{"episodes":0,"reworkTotal":0,"series":[]}` - and exited 0 for a path with a typo. For a
  tool whose entire job is to say *where* the problem is, "no problem" is the most expensive
  answer: nobody investigates a green.
- A repo auditor skipped any repo whose API call did not return state
  (`if observed.get(name) is not False: continue`). Rate limit, timeout, an output format
  change - any of them and it exited **green**, asserting compliance it never measured.
- A subagent delivered a PDF reporting "zero FAIL" on the whole checklist. The page count was
  right, the compiler exited 0, the log had no error marker, the text layer extracted clean  - 
  and the rendered PDF printed control-character garbage above the signature. Two `0x08` bytes
  had been written into the source by a shell heredoc. No command in the checklist could see
  it, and neither could a grep, because a control byte does not become text in the file.

**Rule.** An exit code measures that a process finished. "Don't know" is a violation with its
own exit code, never a silent green.

**How to check.**

- For any scheduled job: list the output directory and compare the newest artifact's date
  with the last expected run. No new artifact means the job is dead, however green. When
  creating a job whose success matters, include the artifact-with-date check in the same act.
- A reader whose source is missing exits with an error naming the path. An empty series
  exists only when the source exists and has no rows. The same holds for a version stamp:
  writing `v: 1` and never checking it in the parser is the same lie, deferred, with v1 and v2
  averaged together.
- "Could not audit" and "audited and found a violation" get **different exit codes** (2 vs 1).
  In CI, collapsing them turns a broken tool into an approved repo.
- A generated document from an agent gets opened and looked at before it is called done.

---

## 5. Smoke proves response; dry-run proves the dry path

**Symptom.** A cheap check passes and gets written into a handoff as "confirmed working",
becoming the next session's premise.

**Cases.**

- A route was declared "confirmed up" from a **4-call smoke test** (exit 0 in 10s). Forty
  minutes later, same route and same gateway, a multi-step task returned **1× 200 then 11×
  429, exit 3, nothing written**; the fallback route gave **3× 504, exit 124, nothing
  written** (measured). Nothing changed in the target between the two - only the size of the
  task. The longer window also exposed a provider leak the short smoke could not have caught.
- Four dry-runs of an outbound send passed clean. The real run broke on exactly the two
  things a dry-run does not exercise: a single-select field rejected free text with **422**
  (a dry-run does not write, so it never validates a write schema), and a fail-closed storage
  guard had never been touched in production, so the real send died on a missing-environment
  error. A batch of one before a batch of thirteen is not decorative caution: it is the only
  instrument the size of the work.
- An anonymous request went from `307` to `401` after a proxy fix, and the issue was declared
  resolved. The `401` only proved the *transport* was right. The same GET **with the real
  token** returned `200` and an empty body - the actual cause lived in the authenticated
  branch, in a scope filter applied only to token principals and not to session cookies
  (measured). That is why the UI showed the resource and the client received an empty list.
- A failover patch was "validated" by a run that finished clean in 25s. The run aborted at a
  pre-flight liveness guard that runs **before** the new code, so not one line of the new loop
  executed. A syntax check had passed, and for a moment that looked like evidence.

**Rule.** A health check of one call is an exclusion filter, never an approval. Anonymous
status codes measure routing, never authorization - scope filters, tenancy and feature flags
per principal live after auth and only appear with the real credential in hand. A test that
dies at a shallower layer than your patch is not a weak test, it is an absent one - and it
looks like a test that ran, because the command exited clean.

**How to check.** Before declaring a route, service or model usable, run **one task the size
of the real work**, with one real target, and audit the whole window of calls rather than the
sample that fit. Before calling a patch validated, point at the output line that exists **only
if the new path executed**. If that line is not in the real output, write "implemented, not
validated" in the commit and the handoff, and record what is missing to exercise it. When an
earlier guard is what aborts, either disarm it for the test or wait for the window in which it
lets the call through.

---

## 6. A signal proves execution only if it could not exist without it

**Symptom.** You read a value off the page, conclude "the script runs", and send the
investigation downstream of a false premise.

**Cases.**

- Diagnosing a blank hero section, an agent measured `getElementById('year').textContent ===
  "2026"` and asserted "the script RUNS, so the defect is later". The `2026` was hardcoded in
  the HTML. The real cause: the file never had a closing `</script>`, `</body>` or `</html>`
  - it ended mid-block, and the whole IIFE had never executed since the first commit.
  `grep -c '<script'` (4) against `'</script>'` (3) settled it in one command (measured). The
  subagent got it right because it **disobeyed** the hypothesis it was briefed with and
  measured from scratch.
- A panel showed "probe has not answered yet" on every card **while the network tab showed
  the requests returning 200**. The 200 was used to clear the front end and blame the backend,
  twice, wrongly. The framework's double-mount discarded the first render along with its
  result. The request really happened; what died was the state update of the discarded
  instance.
- Two rounds of QA proved a visual measurement "done" while the two captured PNGs were
  **100% white**. The acceptance criteria all read the DOM, and every one of them passes on a
  page that never rendered. The fix, now a fixed line in any visual briefing: **count the
  non-white pixels of the PNG itself and print the number** - 0% on the bad run against 100%
  on the good one. A visual artifact needs an assertion about the artifact, never only about
  the state that produced it.

**Rule.** A signal proves execution only if it is **impossible** without it: a value computed
at runtime, or a marker you injected yourself. "Request 200" and "the view has the data" are
two different facts. A valid parse proves the file parses, never that the logic ran.

**How to check.** Ask whether the signal could exist with the code disabled. If it could, it
is not proof. On a page that does not render, compare opening and closing tag counts before
any theory about logic. And when briefing a diagnosis, mark your hypothesis **as a hypothesis
to confirm or destroy by measurement** - that is what saved the first case.

---

## 7. A detector that never accused anything is not evidence of health

**Symptom.** A checker has been green for a whole session while the defect is visible on
screen.

**Cases.**

- A mobile auditor returned `imgNoReservedSpace: 0` all session while a header logo was
  **visibly squashed** on screen. The detector measured the *absence* of `width`/`height`
  attributes in the HTML, not the *wrong ratio* in the render. A human eye found the bug after
  several green rounds.
- A security test proved a storage bucket was private by fetching `media/probe.txt` - a file
  that **does not exist** - and accepting `status >= 400`. A public bucket returns 400 for a
  nonexistent path, so the test passed in exactly the scenario it existed to catch, over a
  bucket of private user files that was open to anyone with the URL. The same defect covered
  two RPCs that do not exist in the database, where 404 is also `>= 400`.
- A CI step asserted "the suite really ran tests" with a grep for any positive test count.
  The entire suite was deleted on purpose and **CI went green** (measured): the runner exits 0
  over an emptied file and still reports one passing test - the empty file counts as a test.
  Fixed with a numeric floor summed across runs.

**Rule.** A detector that never accused anything is not evidence of health, it is absence of
measurement. Prove both sides: inject the defect and require the accusation; require silence
in the clean state. Silent on both means broken; loud on both means noise.

**How to check.**

- Range assertions (`status >= 400`) against a resource the test did not create measure
  nonexistence, not authorization. Require the exact code, and create the resource first.
- When the feared defect is **shrinkage** (tests deleted, items vanishing from a list, files
  no longer copied), a boolean existence assertion is decorative. Use a count with a floor,
  and move the floor with the work - in **both** directions, since removing dead code with its
  tests must lower the floor in the same commit, or the gate goes red for a correct removal.
- A green suite does not excuse review. The red→green cycle proves the code does what the test
  asks; it never asks whether the contract is right. In one case the whole suite was green and
  a code review found the defect.
- Practical detail for injecting a defect without losing work: **commit before injecting, and
  undo by inverse edit**. Discarding with a file-level checkout destroys uncommitted work in
  the same file. That happened three separate times, twice after the rule was already written
  down - the durable form is not remembering, it is only ever planting defects in a file that
  is already committed.

---

## 8. The negative test must fail for the reason you claim

**Symptom.** You inject a defect, the test goes red, and you count it as proof - of the wrong
thing.

**Cases.**

- A CLI suite checked that assembling a video without the narration WAV fails while naming the
  file. Removing the guard `if not wav.exists()` left the test **green** (measured): without
  the guard the encoder blows up on its own, with a nonzero exit code and the WAV's name in
  its stderr. Every downstream error path imitates that symptom.
- A guard was tested through a shell that does not split a comma-separated argument into an
  array. The block happened, exit 1 - but the message named the agent as the single string
  `'agent-a,agent-b'`. It blocked because that is not any agent's name, not because it
  discriminated the one it was supposed to. The block was real and the conclusion was false.
- A mutation done with a plain string replacement on a CRLF file did not match. The file came
  out **byte for byte identical**, the test passed, and the detector was nearly declared
  proven. It had run against no defect at all.
- A replacement without a global flag hit the **first** occurrence, which was in a sibling
  function no test calls. An honest test was nearly failed for it.
- A defect was injected at a point real execution never reaches (dispatch diverted earlier)
  and the suite stayed 28/28 green. The available conclusion - "the test is blind" - was
  wrong: nothing had been planted but dead code. Only after reconstructing the old behavior at
  **both** points, and measuring the output from outside the test (2 lines written vs 1), did
  the verdict mean anything - and then the test really was blind, because it called the inner
  function directly and never exercised the **routing** to it, which was what the change
  altered.
- A test phrase for a prose detector carried **two** accusable clauses. The second one fired.
  Removing it, the first - the attenuated form that was the named acceptance criterion - passed
  straight through. Two green tests covering a case neither of them tested.
- A negative test injected the wrong defect entirely: a mojibake detector had a 5/5 self-test
  built by injecting the Unicode replacement character, which is **irrecoverable by
  definition**. The real production defect was a different corruption in the opposite
  direction, and the detector concluded "0 corrupted". It cost a wrong diagnosis in
  production.

**Rule.** A negative test only counts if the injected defect is **the defect you fear**, and
if it fails for the reason you state. "It went red" is a symptom compatible with a bug in the
test harness itself, and it doubles when the test crosses a shell boundary where an argument
can arrive in a different shape.

**How to check.**

- **Cheapest form, and it beats remembering anything: remove the GUARD rather than inject a
  defect.** If the test stays green without the protection, it measures something else. It is
  cheaper than forging the scenario and it attacks exactly the right question.
- Assert three things together, not one: the script's **own** message, literally; the
  **absence of a traceback** (failed by guard, not by exception); the **absence of a side
  effect** (no file written).
- Sequence: inject → **measure the output from outside the test** → only then read the verdict.
  Skipping the middle step produces both opposite errors with equal ease.
- Print the diff in the same command as the injection, before judging the result. Anchor the
  search on the function signature, not a line inside it. Prove the mutation changed the file
  (compare before and after, abort if identical) before looking at the test result.
- The assertion names the **rule** that fired, never just the exit code. A test phrase carries
  **one** trigger.
- Write in one sentence which defect you are injecting before injecting it. If that sentence
  does not describe the real failure scenario, a 5/5 is decorative.
- A change of dispatch is tested through the program's **real door** (stdin, CLI, subprocess),
  not by calling the inner function.
- Watch the capture layer too: reading a subprocess's output as UTF-8 on a console that emits a
  different code page raises a decode error **inside the reader thread**, the test runner
  reports it as a warning, and the captured stderr arrives **empty**. Two negative tests passed
  having read nothing (measured). Always capture with a replacement error handler.

---

## 9. Measure effect, not declaration

**Symptom.** The gate shouts about a property while the behavior is fine, or stays quiet while
the behavior is broken.

**Cases.**

- A mobile gate flagged **34** images as layout-shifting. Measured by effect, **33 moved
  nothing** (measured). One real case remained. The invariant read `width`/`height` on the
  `img`, but the space is reserved by the **container** (`aspect-ratio`, fixed height).
- The inverse, the same day: the auditor flagged anchors missing a scroll offset property by
  reading the computed declaration. The behavior - navigate to the id and measure whether the
  fixed header covers the top - was correct, because the scroller already carried the
  equivalent property, and the two add up. Auditing a property audits your hypothesis;
  auditing behavior audits the site. The trap is worse baked **inside a script**, where it
  looks like objective measurement rather than opinion.
- Displacement was measured on the **element's own box**, which goes from 0×0 to final size
  even when nothing moves. It belongs on the ancestor's box, or the document height.
- A test that **aborts** an image fires the tag's `onerror` handler, the element disappears,
  and the result has no relation to reality - it inverted the sign twice, showing a jump where
  there was none and hiding the fix after it was applied. The faithful test is a **slow**
  resource, not an absent one. When the HTML has error handling, simulating failure tests the
  handler, not the wait.
- Every page scored ~0 layout shift on a local server. Only with throttled network **and
  scrolling to the end** (lazy loading does not fire on a parked page) did the defect appear:
  0.1416 on one page (measured).

**Rule.** A good invariant measures an observable effect, not a declaration in the code. If
the invariant asks "is it written?" instead of "does it happen?", it will shout in the wrong
place - and a noisy gate dies without anyone turning it off. Absence of the property you
expected is not absence of the behavior: there is usually more than one way to produce the
same effect.

**How to check.** For a behavioral defect, execute the action and measure the result on
screen. Degrade the network before claiming a performance number. Ask where the evidence of
the effect actually lives before picking what to sample. And note that writing the rule does
not immunize you against it: ten minutes after writing "always measure in a mobile context"
into a skill, the same agent measured on a default desktop page and accused someone else's
correct fix of not existing, because it lived inside a mobile media query. The rule has to be
in the script, not in the prose.

---

## 10. The ruler must not live inside the system being measured

**Symptom.** Every invariant has a negative test, and the report is still mostly false.

**Cases.**

- A mobile verifier had a negative test on every invariant and still delivered **33 of 34
  accusations false** (measured), hiding the one real defect. The hole was not in the judgment,
  it was in the **collection**: the snapshot compared overflow against the window's inner
  width, and on mobile the layout viewport inflates to fit exactly the content that should be
  overflowing (an element at 425px, the viewport reporting 425).
- Two independent sessions audited the same site and both landed on the same "8 findings".
  Both were wrong: they ran the same defective auditor. Agreement counts as confirmation only
  when the measurement paths differ. With the same instrument it measures the instrument.
  The same applies to two subagents given the same prompt.

**Rule.** A detector has two parts: the **photographer** (collection) and the **judge**
(invariant). A negative test on the judge alone proves nothing.

**How to check.** Ask: **where does the number I compare against come from?** If it comes from
the target itself, presume blindness until proven otherwise. The reference must be external  - 
a configuration constant, an emulated device viewport, the host's real response, the result of
the formula rather than its text. Close it with a two-ended test **on the real collection
function**: with the external reference the defect appears; reproducing the corrupted reference
it disappears. The second is the guard - if it stays green with a full list of findings, the
blindness is back. Bisection works on detectors too: a worktree at an earlier commit plus the
same measurement command isolates whether a change came from the fix or from noise. In one
session that proved a metric regression came from a layout fix made hours earlier, not from the
file about to be blamed.

---

## 11. A detector's count is not a work queue

**Symptom.** A scan reports a big number and the number gets reported as work.

**Cases.**

- A scan of a skill library flagged **87 broken**. Opening them by hand: **87 → 57 → 17 → 4**,
  and of the last 4 only **2** were real defects, neither of them ours (measured). Each drop
  was an entire family of false positive dying at once. None of it appeared by reading the
  detector's code; it appeared by opening the accused file.
- The seven families, all variations of the detector confusing product with input, or looking
  at the wrong place on disk: a stale cached copy (10 versions of the same plugin multiplying
  one finding by 10); an artifact of the audited target rather than a resource of the tool; a
  file generated at runtime by the thing being audited; a relative reference to a higher root;
  a didactic path inside documentation; a resource shared with a neighbor; an anchor inside a
  file that does exist.
- An eighth family: a prose detector flagged **the documentation of its own fix**, because the
  comment quoted the forbidden string in order to explain why it had been removed. A related
  version flagged **15 of 200** memory files, **100% false positive** - precisely the ones that
  *defend* honesty, because they quote the forbidden phrase to forbid it. A prose detector
  errs in both directions at once, and only a sweep against the **real corpus** shows both;
  fixtures never touch the prose people actually write.
- A ninth: a guard registered behind an existence test, pointing at a path that does not exist.
  Silent no-op - never ran, never complained - and the infrastructure report listed it as
  configured.
- The **cutoff** that decides who the detector judges is part of the detector. Using file
  modification time as "only judge what is new" measures the last time somebody touched the
  file, never when the content was born: in one corpus, **62 of 84** occurrences came from a
  single 406-line file full of facts written weeks earlier by dead sessions (measured).

**Rule.** Do not report a detector's count as a queue until each finding has been opened by
hand at least once. While a known false positive remains in the report, the number is not
sayable - "N broken remain" is a polite lie. "87 findings, and I don't know how many are real"
is better.

**How to check.**

- Per family: fix the classifier plus **two frozen fixtures** - the real legitimate case,
  copied byte for byte, which must **not** fire; and the deliberate defect, which **must**
  fire. Without the negative end the fix is a silent amnesty.
- Before committing the fix, stash it and run only the new test class: it must **fail**. A
  test that passes both ways tested nothing.
- A prose detector must separate **mention from use** before classifying: quoted or fenced text
  is citation and leaves the judgment, and the mask must preserve offsets and line breaks,
  because a real span crosses lines. Declare the trade you accept rather than hiding it: in one
  case, widening the exemption would only have moved the false positive, so the accepted price
  was that certain quoted forms escape the gate - written down as a price, not hidden.
- A guard registered behind an existence test must **fail loudly** when its target is missing,
  or leave the config. A guard that degrades to nothing when its path breaks is worse than an
  absent one - nobody counts the absent one as coverage.
- Opting out of the cutoff is fine; silent opt-out is not. Lost coverage without a counter is
  the same as having no detector - give it its own state, its own bucket in the summary, and
  a warning naming the files.
- The wrong reflex is treating red as a work queue and stamping it. Stamping provenance you do
  not know produces a corpus that **looks** sourced, with the gate's seal on top - the exact
  defect the detector existed to kill, now certified.
- Fixtures prove behavior **per item**, never **the size of the sweep**. If a new filter eats
  too much, the suite stays green and the count drops silently. Register that as a known gap
  rather than letting it become silent scope.
- Uncomfortable corollary: the detector accuses the **best-written** items, the ones that
  document what they produce. A good library makes a dirty report.
- Vocabulary matters here. One session adopted borrowed jargon that had never been agreed in
  the project, and the owner had to stop and ask what it meant. A term that lives only in your
  head is not the project's vocabulary; if the owner needs a translation, the explanation is
  wrong, not the owner.

---

## 12. Synthetic fixtures do not carry the real material's pathologies

**Symptom.** The detector's own suite is green with negative tests, and the detector is still
wrong about the real corpus.

**Cases.**

- A detector flagged **45 of 120** items as missing a required clause. Before classifying
  anything, one positive case was reproduced against the raw file: the clause was there, the
  detector could not see it. Its hand-rolled frontmatter parser truncated a multi-line field
  in **CRLF** files. After the fix: **45 → 24**. **21 of 45 (47%) were the instrument**
  (measured). Its suite was **13/13 green with 6 negative tests**, all fixtures written
  LF-clean by the same author.
- A fix to lead matching passed **424/424 with a negative control** and changed nothing in
  production: the query restricted the requested field list, and the field the fix needed was
  not in it, so it arrived empty at the handler. The fixture built the record **already
  carrying** the field. It tested the consumer, never the path that brings the data.
- A counter's aggregator was proven with a synthetic fixture and declared delivered. A real
  call later recorded **0**. The system had two halves running from different places: the
  **reader** from the repo, the **writer** from an installed copy that had never been synced
  (a grep for the new pattern found 2 in the source and **0** in the cache). A synthetic
  fixture feeds the aggregator lines you wrote yourself; it never exercises whoever
  **produces** the data.
- A fixture cut short gives a false green: trimming a session log at what looked like the last
  relevant line made a negative case pass by accident, because the classifier reads the whole
  stream. A fixture is the real output, in full - with a secrets sweep before versioning it.

**Rule.** A negative test is not enough. The fixture has to inherit the corpus's pathology:
CRLF, BOM, accents, multi-line fields, empty fields - and the real query's field projection. A
field the query does not request does not exist as far as the code is concerned.

**How to check.**

- Before classifying or counting a detector's output, **reproduce one positive on the raw
  file, in the same turn**. A finding covering roughly a third of the universe is a sign of
  instrument defect, not of a rotten corpus.
- Write parser fixtures by copying a real file from the target, not by typing a clean one.
- A fix that depends on a new field must have a test that pins the **requested field list**,
  not only the function that consumes it.
- Ask *who writes the data my detector reads, and where does that writer run from* - then
  prove it with the real subject, not the fixture.
- Never write a decision artifact (buckets, "uninstall X") on top of a count you have not
  reproduced.

---

## 13. The process loads the installed copy, not your edit

**Symptom.** You measure an edit that the process under test never loaded, and the result is
100% green.

**Cases.**

- A benchmark was about to run against a patched component. The patch was in the repo
  (23,366 bytes, one sha); the harness loads that component from a **plugin cache** still
  serving 23,390 bytes and the **old** sha - exactly the "before" target (measured). Caught by
  comparing shas by accident, not by process. It would have returned 100%, identical to the
  before, with every acceptance criterion ticked and a non-regression verdict issued without a
  single line of the patch being loaded. The failure mode is silent and green; nothing accuses.
- The same counter later read **0** for a second reason: a parallel effort had retired a
  marker and, doing so, **removed the hook from the event block of the harness config**. The
  regex was right, the function was right, the event never arrived. A fixture tests the
  **function**; the registry decides whether it is **called**. Two artifacts, and green on one
  says nothing about the other - so an event-driven instrument needs a negative case that reads
  the **configuration** and demands the registration.
- After installing a new version, the plugin registry updated its install path and version and
  left the commit sha and timestamp **three commits behind**. A procedure that proved
  installation by that registry field would have rejected an installation that worked. It
  repeated on the next install with a different sha, so it was not chance.
- A local model was deleted from the machine. Days later the config still named it as the
  default. Reading the config and finding the right value via the runtime's own list **fixed
  nothing** - the file the process loads kept lying.

**Rule.** Between the file you edit and the file the process loads there is almost always a
copy: plugin cache, dependency directory, build output, container image, CDN. Finding the
right value is diagnosis, not repair; the repair is editing the file and proving by a second
command that it now reflects the machine.

**How to check.**

- sha256 of both paths, compared in the same turn. "I installed it" does not count; the number
  counts.
- A cheap positive probe that only passes if the new text is live.
- The report records the sha of what was **loaded**, not the repo's.
- Prove installation by grepping a **new fragment of the patch inside the file at the install
  path** - never the registry field, never "already installed", never an aggregate reload
  count.
- A version number written in a handoff expires in hours: two consecutive version bumps
  collided with numbers another effort had already published upstream (measured). Read the
  remote before bumping.
- After changing the environment, **re-probe before concluding it did not change**. Two
  negative probes measure a state, not a rule. One case: a reload was declared ineffective, the
  claim was written down as fact and **propagated to three sibling sessions**, one of which
  recorded it in its own memory and replanned a ticket on it. A second reload - whose own
  output printed the number of hooks loaded, the evidence that had been there and unread  - 
  made the field appear immediately, in the same session. A fact that has already gone out to
  other sessions comes back as an explicit correction, not as silence.

---

## 14. A green suite does not prove the gate runs

**Symptom.** The check exists, the tests pass, and nothing stops the defect from shipping.

**Cases.**

- A gate was written and the invariant declared "protected". The CI workflow **did not run the
  test command** - it built the site and checked one contract, nothing else. 102 tests and the
  gate existed only on one machine. A commit reintroducing the forbidden call would pass CI
  green.
- An auditor measured a third-party repo's CI as `total_count > 0` on the runs API: the
  existence of a registered run was enough to absolve. One repo sat **6 days with a failing
  build** while the daily audit printed "executed" and closed with "all repos in the desired
  state" - **10 consecutive green runs** blind to the red (measured).
- A gate extracted its verdict with a regex over the detector's **human scoreboard**: the guard
  was `!/0 pending/.test(summary)` against the phrase `"14 pending"`. `0 pending` matches as a
  substring of **`10 pending`** - and the next migration passes through exactly 10. Worse: if
  the detector changed its scoreboard wording, no regex would match, the variable would be
  empty and the gate would publish `ok` on a blank - fail-open on a contract nobody declared.
- A detector **contracted** (a warning became a failure; one cause of exit 1 became two) and
  every consumer branching on the exit code started naming the wrong cause: right verdict,
  wrong explanation, which is the failure mode nobody checks. It printed "the auditor is
  broken, the defect is in <the auditor>" when the defect was in the audited file - sending
  people to fix the healthy artifact and never naming the culprit. The suite stayed 29/29 and
  the exit stayed 1.
- Three anti-leak hooks had a 9/9 negative suite for weeks and **no evidence of ever having
  fired** with the runtime live. Probing cost 3 tool calls and closed an item that had been
  open for three weeks.

**Rule.** Delivering any check answers, in the same turn, **who executes this when I am not
here**. Until someone else runs it, the honest phrase is "honor gate", not "protected".

**How to check.**

- Read the CI workflow and quote the line. "There is CI" does not mean "it runs my check". On a
  private repo on a free plan, a red job signals but does not block a merge - say that instead
  of selling protection that does not exist.
- Prove the negative on the **execution path**, not just the script: seeing the gate red on
  your machine proves it detects; proving it protects requires seeing CI red with the defect
  on a throwaway branch, and green without it.
- Run the check in a **clean clone** before wiring the job. A suite can be green because of
  machine state - one harness read a gitignored results directory full of local runs, and went
  red the moment it ran from a fresh archive.
- Run the standalone check **before** the suite in the job. Inside a test runner the log only
  says "a test failed"; standalone it names the file and the line, and that is the first
  message on the reviewer's screen.
- Extracting code into a shared module includes, in the same commit, the gate item that runs
  its suite - before its consumers, not after. A shared module with no gate item of its own is
  worse than a missing test: both consumers read through it, and when it breaks each detector
  reports itself healthy.
- A gate consumes the detector's **structured output** (`--json` → parse → count fields), never
  a regex over the human line. A parse failure is an explicit error, not an empty `ok`. In
  JSON mode stdout is only JSON - a human scoreboard after the JSON on the same channel breaks
  the consumer's parse. And note that a detector's own suite does not cover the detector's
  **consumer**: 29 cases passed while the gate read them wrong.
- A detector of third-party CI asks for the **conclusion of the last completed run**, and only
  success absolves; cancelled and timed out are runs that ended without proving anything. Query
  completed runs only, or you judge an in-flight run whose conclusion is null.
- When a detector contracts, grep the readers for the exit code and open each one. Consumers
  read the **data**; the exit code only cross-checks that both tell the same story, and a
  divergence between them becomes a named error. One message per fix - summing two defects into
  one message sends the reader to the wrong repair. When running the injection, **read the
  message, not the exit**.
- The summary line is derived from the **same verdict** that decides the exit code. Written by
  hand it lies without breaking any test: one counter summed distinct causes and told people to
  fix the wrong target; one unconditional sentence asserted the opposite of the exit code in the
  same breath. One cause, one number - in the green case the summary is the only output the
  operator reads.
- Auditing a gate's output starts **without a filter**. Grepping the negative case's output
  before you know its shape cuts the evidence: it nearly produced a report that "the detector
  does not name the agent" when it named it, line by line.

---

## 15. A gate is a positive assertion, never the absence of the forbidden

**Symptom.** Every prohibition check is green and the artifact is empty, broken, or missing
the thing that matters.

**Cases.**

- An **empty** build directory was deployed and took a whole site down - 404 on the root and
  every page - twice in a row, during an urgent content removal. A measurement server was
  running with its working directory inside the build folder, the rebuild hit a busy-resource
  error, the cleanup failed and the directory ceased to exist. The deploy tool uploaded that
  without complaint, reporting a successful deploy. Every prohibition grep (`forbidden
  refs: 0`, `design sources: 0`, `forbidden files: 0`) passed green - **an empty folder passes
  all of them**. What caught it was a **positive control in the same command** as the 404
  proof: request `index.html` expecting 200, and get 404.
- A design gate written as a blocklist let through **the exact typeface the decision existed to
  eliminate**. Two more defects in the same gate: a grep for `serif` matched `sans-serif` and
  failed the *correct* state; and every grep read the build output, which is gitignored, so
  running the gate before the build passed in silence.

**Rule.** A blocklist only catches what somebody remembered to list. Write the gate as a
positive assertion: a closed allowlist of what is permitted, failing on anything outside it; a
count of files and pages that must exist; absence of the target as an **error**, never an
approval.

**How to check.**

- `test -d <target> || exit 2`, strict shell flags, and the build→gate order inside the same
  CI job.
- **The negative control is written by whoever audits, not by the gate's author.** In one case
  the author's two controls passed and the auditor's third brought the whole thing down.
- Keep the measurement server **outside** the target's tree, with an absolute directory
  argument, and kill it at the end. A process that failed to take the port stays alive holding
  the handle; a port held by another session serves a different folder and returns 404 for a
  file that exists.
- Contract checks run in **both directions**. One validator checked only code → database (every
  declared value exists there) and never the inverse, so the database accumulated a value the
  code did not know about, with no alarm at all.
- A gate that does not run in the environment it guards is a different failure: one gate
  depended on an artifact that CI deliberately does not install and stayed red there.
  **"Not checked" and "failed" need opposite severities** - a loud warning and an error. Measure
  a new gate in a clean worktree from the remote's main branch, which is the cheap reproduction
  of CI, not only on the author's machine.

---

## 16. An aborted suite is a blind gate, and red lies too

**Symptom.** A nonzero exit that means "never measured", read as "measured and failed".

**Cases.**

- A test bench exited **99 / "ABORTED: patch did not apply"** right after an edit, so the edit
  looked guilty. Stashing the edit and re-running gave **the same exit 99**: the bench had been
  blind since a commit from **the day before**, and nobody noticed. Once fixed, it immediately
  found a second old defect - an assertion demanding a value the code had been changed to never
  produce.
- A test file imported its source from a **gitignored** directory. Locally the file exists and
  the suite reported 158/158; on the runner the import threw at top level and the whole file
  died, so **33 tests never ran in CI** - including the invariants protecting the send path.
- A harness had three verdicts: passed, failed, invalid. But the doctrine it measured
  **orders a stop** in two situations. In the three cases where the target correctly stopped,
  the scoreboard recorded **failed**, and a raw 1/4 became "it does not route" when the log said
  the opposite. The instrument failed exactly the behavior the rule commands.

**Rule.** A nonzero exit from a suite has two opposite meanings that the output blurs:
*failed* (it measured and the target lost) and *aborted* (it never measured). The second is a
blind gate: it protects nothing and does not announce that it stopped protecting. If the target
has a legitimate state of deliberately not acting, the verdict space needs a name for it  - 
otherwise the number punishes obedience and pushes you to "fix" the component that was right.

**How to check.**

- Before blaming your own change for a broken suite: **stash and re-run**. Cheapest control
  there is, and it applies equally to "this started failing just now".
- Read the line that says **how many cases ran**, not just the exit. `cases: 14 | ok: 14` is
  evidence; `ABORTED` with exit 99 is no verdict at all.
- Local green plus CI red on the **same commit** means suspecting a file the test reads and git
  does not version, before suspecting the code.
- Separate **invariants** (always run, depend only on versioned files) from **checks against an
  external source** (conditional, and when skipped, skip **loudly**, with the reason in the
  output). Prove the fix with a positive control: rename the source, run, watch the skips
  appear.
- List the target's legitimate outcomes **before** writing the criteria, and confirm each one
  has a verdict. Binary only works when the target cannot abstain. The abstention verdict needs
  a criterion as hard as the success one, or it becomes an excuse - in the case above,
  "stopped correctly" required naming the gate or specialist in the final text plus a question
  or an offer; a silent stop still counted as a failure. Each fixture declares its expected
  outcome.
- A fixture whose right answer is "there is nothing to do" measures nothing. Fix the premise or
  turn it into a declared abstention case.
- When the scoreboard contradicts your reading of the log, the **measurer** is suspect number
  one.
- A platform failure ("you've hit your session limit") is **invalid**, not a failing verdict  - 
  it cost nothing and should not count as a defect of the target. Re-run after the reset.
- A fixed suite runs **in full** before commit; fixing the startup usually uncovers old
  assertions nobody was executing. Record in the code comment **since when** it was blind and
  what unblinded it, or the next session repeats the diagnosis.

---

## 17. A number without its instrument is testimony

**Symptom.** A number enters a ticket, a briefing or a report, and there is no way to explain
why today's differs.

**Cases.**

- A fail-closed comparator was built against **7 frozen numbers**. Everything green, negative
  test done, a paid run of US$ 2.06. Two scenarios blew past the threshold and the cause was
  not in the target: **the baseline never had any backing** - the 7 numbers had been typed by
  hand into a design document, and a search for raw logs from that window came up empty.
  Worse, between the two measurements the runtime updated a patch version and the settings file
  changed, and since none of that was recorded, the investigation ended with no possible
  verdict. The estimate in the spec had been US$ 8–10; the real cost was US$ 2.06.
- A "before" measurement came out at **3/3 = 100% with the component untouched**. That is not
  approval of the patch, it is a ceiling effect: with a saturated baseline the "after" can only
  tie (proving nothing) or get worse. Whoever does the right thing - measuring before editing  - 
  is exactly who discovers the saturation in time.
- A comparison baseline was built with `HEAD` instead of a literal hash, and a sibling session
  committed between that command and the measurement. The diff reported **"+3 new violations"**
  that belonged to the neighbor's commit; the real delta was zero regression. That commit also
  carried an edit from the working tree, so the baseline did not even run.
- A session opened on "I average 83 characters per prompt", remembered from an earlier
  conversation. Counted before designing anything: mean **62.8**, **median 33**, 76.2% under 80
  characters, over **1,663** prompts (measured). The "83" exists nowhere on disk.
- A handoff said "one line marked VERIFY" in a data file. There were **six** (measured), and
  one of them hid a false qualification. The same handoff listed "3 unpushed commits"; the
  command in the same turn returned **4**.
- A subagent was briefed with "test suite: 42/42", copied from a handoff. The real suite had
  **195** tests. The agent checked and corrected the briefing; obeying it would have reported a
  regression that does not exist.
- A gain of **1,483 tokens** was reported. The real figure was **493** (measured). The error:
  subtracting two *different scenarios* measured hours apart, while another session enabled
  three plugins in the middle. The control scenario rose by 5,846 and that rise became
  "savings". The total also hid two opposing movements: the component actually touched went
  down 645 while a different component grew 152 on its own.
- Cutting 7,287 characters of agent descriptions yielded **493 tokens** of startup budget.
  Proving that behavior did not change cost **US$ 24.48** across 11 headless sessions, with a
  case-by-case verdict including which agent was dispatched (measured).
- A measuring tool was rewritten, tested and installed, and its series had **zero rows** - it
  was about to arbitrate a cut using the old series, the very defect the rewrite existed to
  kill. With a fresh baseline (998 dispatches, 208 re-dispatches), opening the cases one by one
  knocked **58%** off the number: the unit summed different pieces of work in the same session
  (measured).

**Rule.** A number that becomes a gate carries, on the same line, the **state of the
instrument**: tool version, timestamp, hash of inputs outside your control, the name of the raw
log. A number by itself is testimony. A/B comparisons happen on the same target, with the same
instrument, with everything else still - and a machine running concurrent sessions has no
"everything else still".

**How to check.**

- Before freezing: *could another person, on another machine, explain why today's number
  differs?* If the only answer is "something changed", do not freeze yet.
- When a detector drifts, **suspect the witness before the target**.
- A **missing** metadata field fails the gate; a **divergent** one only prints a reason. A gate
  that goes red every week from automatic updates dies of fatigue, and an ignored red is not a
  gate. Re-freezing requires a written cause, or it becomes the lazy way to erase red and a
  self-updating detector never detects anything.
- When delivering a "before", state whether there is headroom for the "after" to improve. If
  there is none, bring the options back to the decision-maker - harden the case until the
  "before" fails somewhere, apply the patch declaring it enters without evidence from that
  instrument, or do not apply it. What is not an option is running the "after" to see.
- Build baselines with the **literal hash** from the log command in the same turn, put that hash
  in the report and the commit, and when suspecting a regression, diff the **list** of
  violations, not the total - the names point at whose territory it is. A collection failure in
  a baseline is not an obstacle to work around: it signals the two sides diverged underneath.
- Before reusing a baseline, list **which cases it contains** by command and compare with what
  the new run will measure. An artifact's existence is not coverage: one "before" existed, had
  a sha and a cost, and covered 1 case out of 9. A gitignored results directory means archiving
  a versioned copy per case is part of measuring, not cleanup afterwards.
- Any count going into a briefing, plan or artifact is recomputed by command **in the same
  turn**. A handoff says *where* to look, never *how many*.
- Before concluding anything about a series, **count the rows per version**. An empty series is
  an answer, not a detail. Before proposing a cut or a ceiling, open the cases and classify  - 
  a table does not distinguish repetition from new work. Declare the bias in the direction you
  know: if a category counts as zero, the number is a **floor, not a ceiling**.
- Instrument before target: prove by diff that cases, classifier and scoring rule did not change
  between the two sides. Costs nothing and invalidates the whole run if they did. A paid run's
  scoreboard is **regenerated** from the logs already recorded, never re-run to reclassify.
- The ceiling of a cost gate is the worst case summed, not a forecast. Authorizing spend up to a
  ceiling and then comparing the real cost against it and calling the difference "savings" is an
  illusion.
- A platform failure is invalid, not a failing verdict - open the raw log and re-run after reset.
- Before writing a numeric target into acceptance criteria, measure the ratio of the vector
  (chars → tokens, lines → ms) on a small case. One criterion was physically impossible: at the
  measured ratio, the entire text in play could not produce the promised saving. A criterion
  with no physics behind it is corrected **in the ticket, with the arithmetic written out**  - 
  not by massaging the number or ticking the box out of generosity.
- A cost number ages with the corpus it measured. The same automatic memory cost 10,735 one day
  and 7,699 the next with nothing changed in the instrument - the corpus had shrunk from 23,826
  to 16,378 bytes in between (measured). Quote the corpus size of that day, or it is testimony.
- Check the accounting: one profile failed a budget at **42,079 against 31,800** without gaining
  anything, because the raw measurement summed a **global** load that does not belong to the
  profile (measured). The ceiling was not wrong, it was charging the wrong account. Decompose
  the number before judging the target, and run the neighbouring gates before blaming your own
  diff - one suite had been red for two days from two hardcoded counters that aged on their own.
  A counter in a test comes from disk or from an existing canon, never from a fresh literal;
  changing a 4 to a 5 only moves the ageing.
- A size ceiling needs two separate checks - did it grow too much, and **does it fit in whoever
  reads it**. One budget allowed 204 lines while the consumer truncates at 200, so the meter
  reported "within budget, zero headroom" on the same day the runtime warned that 4 lines were
  cut (measured). The 4 invisible lines were the newest, and one of them described an error
  committed twice that same day. The reading check must fail both the file **and** a ceiling
  configured above the consumer's limit, or the next re-freeze raises the ceiling and the green
  lies again.
- A test case written about the **real state of a business** rots on its own and starts failing
  whoever is right. In one paid run, two of five "failures" were expired premises - a path that
  had moved and a claim about a brand that had ceased to be true days earlier. The session under
  test refused the false premise, which is the correct behavior, and the scoreboard counted it
  as a failure. Write cases on premises that do not age (a fictional subject declared inside the
  prompt, a path the test itself creates); if a case must depend on real state, it carries the
  date and the source, and is re-checked before any paid run. And re-reading does not fix it:
  a reclassifier reads the trace, not the prompt, so a rewritten case has **no valid verdict**
  until a new run.

---

## 18. Declared is not done

**Symptom.** An approval, a path or a decision is recorded, and everything downstream treats it
as a fact about the system.

**Cases.**

- A subagent closed its step with **"Done. Artifact: `<path>`"**. The file was never written:
  filesystem search, git history across all branches, four worktrees and the stash all came up
  empty. The handoff copied the path and the next session planned to implement a spec that did
  not exist. The only surviving output was a 10-line summary, and a dozen researched candidates
  with sources and licences were lost.
- A redesigned hero section was approved, left in a scratch directory, and **never entered the
  published page**. Proven in two commands: grep for its selectors in the live file returned 0,
  and the history showed no commit had touched that structure. Three days and several sessions
  went past without noticing, while the owner said the site "still isn't nice" and, in the next
  sentence, "I already approved changes that never went live".
- Publishing previews was approved "by link, with a noindex meta tag plus a header". The pages
  had the meta tag; the **header never existed** - the config had no headers block at all. Half
  the protection was imaginary, and it only surfaced because a compliance review read the config
  instead of the decision. In the same batch, a 30-day expiry existed as a decision with **no
  mechanism** executing it, which is exactly the shape of an earlier incident where a preview
  stayed up for 44 days.
- A whole spec was written on the premise that a capability did not exist anywhere in the
  organization. An audit of ~63KB of code knocked half of it down in one turn: four serverless
  functions covering exactly that scope **already existed and were deployed in production**,
  committed five weeks earlier, with compliance and a dry-run lock built in. Tickets were about
  to be published ordering the construction of what was already built.
- Two open tickets in a row had stale descriptions and the work already on disk. They were open
  because nobody closed them, not because work was pending. Separately, two issues sat `OPEN`
  for hours after being fixed, committed and pushed; it only surfaced because the open issues
  were counted by command at session close.
- A request arriving from outside carries premises about your repo, and they get checked the
  same way. A panel built elsewhere was described as "not connected to any CRM, spreadsheet or
  external API" (reported). True of the panel, false of the target: the target already ran a
  CRM with a versioned contract, a CI gate, and **two open issues about dashboards, one of them
  deciding against a new interface** (measured). The briefing also shipped a ready-made data
  model - a parallel canon over the same funnel.

**Rule.** Approval, decision and integration are different states. A subagent's return is an
assertion, not a fact about the disk. A plan or spec describing "what is missing" starts with an
inventory of what exists, produced by command, in the same turn - that is the gate, not the
optional "explore the repo if there's time" step.

**How to check.**

- Before writing "Artifact: `<path>`" anywhere, run a listing of that path in the same turn.
  Without the file size on the line, the item is "declared, not verified". The damage does not
  stop at the step: a false path in a handoff redirects the whole next session's plan.
- An approved design is closed when a grep for its selector finds the code in the **published**
  file - not in the deck, not in scratch, not in the handoff. Resuming a design effort starts
  with that measurement, before any planning.
- Before counting any protection, gate or header as active, open the file that implements it and
  see the line. A protection with a deadline needs an owner and a mechanism, not a date in a
  document. A pre-deploy checklist **proves** each protection (header served, gate running),
  never that it was written.
- The symptom of violating the inventory rule is writing the word "zero" about your own
  capability without having run anything. A subagent's inventory becomes fact when you open the
  files yourself and hit the endpoint.
- Grilling and user approval do not validate a factual premise. Rigor about the reasoning does
  not substitute for evidence about the world. A related symptom: writing "approved" over an
  item only you drafted, because the user answered 3 of 9 questions and you filled in the rest.
- A superseded spec is **marked**, not deleted - a notice at the top with the reason and the
  evidence, so the good work inside survives the bad premise.
- "Does it already exist?" applies to code, database tables, tooling and third-party profiles.
  An existing tool with an inverted rule is more dangerous than a missing one, because it gives
  no symptom: one scoring heuristic ranked *in favor* of the records the effort existed to
  exclude.
- An artifact hosted on a third-party platform behind a login is not an input until it becomes a
  file in the repo. One such page returned HTTP 401 to any agent (measured), which made "preserve
  the current layout" unexecutable rather than hard.

---

## 19. Second-hand facts, and sources that expired

**Symptom.** A sentence arrives well-written, with a polite caveat or a citation, and it
propagates.

**Cases.**

- One session wrote, by inference, that the exact minute of a deletion would come from a
  platform's audit log. A sibling session picked up the sentence, added a caveat, and sent it
  into a **legal opinion** - also without running the command. The command existed and knocked
  it down in 30 seconds: that log does not record deploy deletions at all (2 pages × 100 events,
  descending, zero on the day in question, no truncation, and the 26 audited event types do not
  include it) (measured).
- A list produced by a different AI was brought in for use. The parts it **copied** held up:
  phone and address matched the directory **3/3**. The parts it **synthesized to fill a column**
  did not: the column the whole effort rested on was false **2/2**; group ids were wrong 3/3
  with the names right; and "34 verified phones" had 8 rows with a placeholder in the field,
  checkable in the file itself (measured).
- Grep confirmed that a law article existed in the statute text, and an internal document cited
  it for **20 days**. The provision had been **repealed six years earlier**, marked in the
  consolidated text by an ellipsis and a footnote naming the repealing act. The subject matter
  had migrated to another act **under a different term**, so searching the old term in the new
  statute finds nothing and misleads in both directions.
- Research into a third-party product's capabilities was written six weeks after the product had
  been **renamed**, under the old name, with nothing flagging it. Searching the old name does not
  fail - it returns abundant, coherent material describing screens, limits and plans that may no
  longer exist. The error is silent: the document comes out finished, with sources, describing
  the wrong product.

**Rule.** A message from a sibling session, a handoff, or another agent is a hypothesis, exactly
like a subagent's return. A caveat is not a measurement - arriving well-written and hedged is
precisely what lets it through. Presence in a corpus is not currency: a source that answers is
not a source that is in force.

**How to check.**

- Before propagating into an opinion, a decision record, a briefing or a delivered artifact, run
  the command that would check it - and if no such command exists, say so. "The platform does
  not log it, therefore nothing could be done" is an alibi, not a defence: choosing a plan
  without an audit trail is the controller's decision. The honest framing has three layers - your
  own record as primary evidence, the absent independent trail as a **declared limitation**, and
  the missing trail as a debt in a future measure.
- In material from another AI: keep the reasoning, discard the data. Recompute the counts in the
  file, verify identifiers, and never accept the column that **motivates the action** without
  your own check. Fabrication concentrates exactly where a field is mandatory and verification
  costs one lookup per row - which is precisely the column that shows up in the first sentence
  of contact with a customer.
- Before citing an article that supports an operation, read that article's footnote; if there is
  an amending act, open it and see what it did. An orphan cross-reference inside the statute is
  itself confirmation of partial repeal. The same applies to technical standards, platform terms
  and policies.
- Before surveying a third-party product, confirm the **current name** in the vendor's own
  documentation, not the first search result. If the name changed, redo the search and record
  the change where the next step will read it, rather than rewriting the work already done.
- Scope is also a claim that gets re-measured. One incident opinion was written over **one**
  deletion commit and stood 22 days covering half the incident - there was a second commit four
  hours later the same day, and the real scope was double what the opinion stated. In the same
  effort, 9 of 9 ticket descriptions understated the scope, always downward.
  Sweep the whole source, not the first hit; when an inherited premise falls, the correction goes
  **dated, beside** the original, because an incident document rewritten in place loses its
  evidentiary value.
- The same applies to claims your own agents rewrite. A false claim on a page was sent back for
  correction with the evidence in hand; the agent fixed it and invented a **new** false claim in
  its place, and the invention had already leaked into three more places in the document.
  Whoever rewrites has an incentive to preserve the force of the original, and the cheap way to
  preserve force is to invent again. The agent's return describes what it thinks it wrote, not
  what it wrote. Re-check the rewritten claim **at the source**, and sweep the whole document
  with a grep for the claim's vocabulary.
- A false claim can also live in an **orphan file**. One script carried four fabricated customer
  cases and three fabricated metrics, loaded by no page since the scripts were removed from the
  markup - but the build's allowlist publishes whole directories, so the file answered 200 in
  production. "No page loads it" answers whether a user *sees* it, not whether the server
  *serves* it. Sweep claims over the **built** directory, including scripts, data and images, not
  only the linked pages.
- Recommend on the axis you will be judged on. One model was recommended as a cheaper
  alternative citing price per million tokens and throughput; opening the model card afterwards,
  its accuracy scores were **below the previous generation's** on the benchmarks that mattered.
  A launch blog, a pricing page or a gateway catalogue talks about throughput and latency. None
  of that is accuracy. The inverse fallacy is identical: "it is newer, so it must be better".

---

## 20. Suspect your own instrument first

**Symptom.** The target is unstable, the model is dumb, the API is down - and the thing that
changed is your apparatus.

**Cases.**

- Half a session went into chasing "the app is unstable" - click timeouts, connection refused,
  the dev server dying on its own. The app was fine. The browser automation profile had been
  created **inside the repo**, the bundler's watcher tried to observe the temp files the browser
  writes there, and the dev server fell over with a busy-resource error.
- A QA subagent served a build directory with a local HTTP server and the process **outlived the
  subagent**. Two hours later, deleting that directory during a rebuild failed with
  "device or resource busy", and the first reading was "the build broke".
- A safety guard blocked the writing of the very handoff that described a blocked command,
  because the text **quoted** the risky command literally. The obvious fix would have opened a
  hole of its own, so the false positive stayed. A guard that forces you to
  bypass it in order to record the work teaches you to switch it off; a false positive in a
  security tool is not an aesthetic annoyance, it is how the tool dies.
- The worst form: the instrument **performed the real action**. An admin function was called
  expecting the rehearsal that three documents promised ("dry-run since forever"). It returned
  `"mode": "LIVE"` - the flag was enabled on the host - and the function **took the real,
  irreversible external action**. Nothing reached the outside world, and only because an
  upstream provider's quota had run out: an accident, not a lock. The same response also handed
  back signed URLs in its body, and a signed link is a bearer credential, not a log line.
- Five findings in one infrastructure session all dissolved on verification, all the same shape
  - a test correct in the general case, applied without the context that invalidates it:
  a grep for a carriage return matched the **letter r** (in binary: zero CR); "16 files exposed"
  was a catch-all returning the homepage with status 200 for any path; a "not removed" grep
  matched **the comment the agent had just written**; a font flagged as generic was the project's
  own brand token; and "the site did not publish" came from comparing checksums of a **minified**
  response against the raw build. Normalizing whitespace, the checksums matched. The fifth
  happened **after** the pattern had already been named, which shows that recognizing the bias is
  not enough - the test has to change.
- A "it's an environment artifact" laudation absolved the code: a blocked resource error was
  attributed to local HTTP. A plain HTTP client showed **404, HTML, 1,583 bytes** - and a
  deliberately invented container id returned **1,582** (measured). The container had never
  existed.
- A label was measured across four cities and always showed the same transform, so "the element
  is not anchored to coordinates" was concluded and two briefings were dispatched to fix a defect
  that did not exist. The constant value was the exact center of the viewport, and since the
  camera points at the labeled city, the **correct** projection is the center. The control that
  was not run: move the camera. Shifted by a degree, the label moved, and back.
- Two sessions accused a subsystem of leaking calls to a paid account because a gateway's call
  log showed a particular provider prefix. It became a diagnosis, a code comment and a fix plan.
  The missing control: one explicit call using the **legitimate** path was logged with the
  **same** string. The gateway normalizes the prefix; in that log the legitimate call and the
  suspect call are indistinguishable, and the planned fix had nothing to fix. A corollary
  measured the same day: an environment variable that appears in the binary is not an environment
  variable that takes effect - the proof is the log after execution, never the grep.
- A third-party agent answered "I CANNOT SEE IMAGES" and the whole effort was nearly closed as
  "that CLI is blind". It was a permission gate: with no matching allow rule, headless mode
  auto-denies the file read and the model answers with what is left. With the permission, it read
  images and video.
- A failover timeout of 90s killed the only live route, which takes ~90s per call: the log showed
  200, 200, then a **client-side abort**. The reading had been "that route is flaky", written into
  a handoff. The flakiness is real; that particular run was our own patch.

**Rule.** Before accusing the target - unstable app, dumb model, API down, unstable supplier  - 
prove the instrument is not the cause. The instrument is the measuring script, the browser
profile, the proxy, the cache, the dev server started a different way. If the alarm is
surprising, the test is the first suspect, not the system.

**How to check.**

- Ask: *what did I change in the apparatus before the target "broke"?*
- Leave the instrument: an error seen in the browser gets re-measured with a plain HTTP client.
  Gone outside the browser, it was the environment; still there, it is the resource.
- Use a **deliberately invalid control**: a made-up id, URL or key. If the real resource answers
  the same as the fake one, the real resource does not exist.
- A **constant value does not prove absence of a link** - it proves the input did not vary. Vary
  the input on purpose and see whether the output follows. This applies to coordinates, caches,
  seeds, timestamps and any "it is always the same, so it must be broken".
- Before blaming a component for an intermediary's log, make **one control call with the value
  you consider legitimate** and compare how the two appear. Identical means the field separates
  nothing: stop the diagnosis there. And the cut that works usually does not go through the log
  at all, but through a separate credential with an allowlist, which fails loudly regardless of
  who called.
- Distinguishing a declared incapacity from a gate has one question: **did the call return
  anything?** Returned content means believe the refusal; returned nothing means suspect the
  gate. And capability is not measured in a block: "reads video" is three axes (still image,
  motion, audio), and a synthetic subject only proves the container is accepted. Check the
  subject's own ground truth before asking the question.
- Before accusing an external supplier of instability, grep the log for **your own** abort. A
  clock-based timeout cannot tell "did not answer" from "is slow" - both arrive as "still
  running". Every failover timeout needs an answer to "what signal tells me this attempt is
  progressing?" (status per call, bytes, heartbeat). Calibrate the ceiling against the case that
  **passes**, never the one that fails, and distrust a ceiling derived by dividing a budget by
  the number of candidates: adding a fallback then shrinks every attempt, the opposite of the
  intent.
- When the symptom repeats twice in the same place, stop stacking attempts and isolate the layer:
  disk → server → network → browser.
- Before calling a function with an external effect (send, charge, publish, delete), measure the
  real mode through a path that is **not the action itself**. Mode of operation is host state, not
  a fact of the repository - three files claimed the rehearsal and the host said otherwise. A
  field name in the response ("would send live") is not a runtime guarantee, and an instrument
  that walks the same code path as the real action **is** the real action, with different luck.
- A subagent that starts a server leaves an orphan. Before blaming a stuck build or deploy, list
  who holds the path - by command line, not just process id - and never start a server whose
  working directory is inside what the build deletes.
- Tests and documentation for a guard write the risky text into a **file**, never inline in the
  command the shell sees.
- **While the error message changes with each fix, the diagnosis is not over**: those are stacked
  defects, and the first masks the next. Only an identical repeated symptom indicates a single
  cause. One boot failure went config error → stuck state migration → phantom plugin demanding
  consent: three distinct causes at three points (measured). Each round of fixing ends with a real
  execution of the target and reading the **new** error, not with the absence of the old one. When
  a service dies without saying why - a scheduled restart swallows the cause and leaves only a
  timeout - run it in the foreground capturing both output streams; the real error shows up in
  seconds instead of minutes of blind waiting (inferred).
- The terminal can lie about the data. On a console using a legacy code page, correct UTF-8 shows
  up as replacement glyphs, and one agent declared "the name is corrupted in the code" from
  looking at glyphs. The server log printed the accent correctly and inverted the diagnosis: the
  code was right and the **database** was corrupted. Compare **code points**, never rendered
  glyphs.
- For a bug in a deployed function, the **first** resource is the execution log, before grep,
  schema reading or code-point comparison. One agent spent half a session inferring a field-name
  bug that a single log line named outright. Note the log window is a stream, not long history:
  trigger the event, then read.

---

## 21. Run the command that answers *that* question

**Symptom.** A plausible neighbouring command answers something adjacent, and the alarm goes out
anyway.

**Cases.** Three wrong alarms in one session, same shape:

- "The crash affects 4 pages", measured by grepping for the **markup** of the affected component.
  The right question was who **loads the script**: **1 page** (measured). A subagent caught it.
- A contrast failure reported at **1.14:1** was measured against the body's background. Measured
  against the **effective** background - the ancestor that actually paints - the same element was
  **8.61:1** (measured). A defect invented by the instrument, on the same day a real contrast
  defect was fixed.
- "A worktree has 2 lost commits", read from a worktree listing. The right question was answered
  by asking which branches contain the sha: they had been on the main branch since a merge.

And the same failure applied to **severity**: a test message arrived with another record's copy,
and the agent announced that the next send batch would put the wrong text in front of 12 real
readers, on which basis a decision was made. Wrong. The real condition selects copy by "does this
record have an entry?", and all 12 do. Only records **outside** the entries inherit someone
else's text, which is exactly what the test record was. The defect existed - it was a genuine
fail-open, and it was fixed. The blast radius was invented, from the symptom and the code **comment**, which described
the old behavior, rather than the condition three lines below.

Separately, chaining the check to the action defeats the check: `git log <range> && git push`
puts the output in front of your eyes **after** the fact. In a repo with concurrent sessions the
batch is perishable state; that chain pushed a sibling session's commit to a live-deploy branch,
which an explicit rule forbade.

**Rule.** Before writing "this affects N pages" or "this is lost", write the question in one
sentence and ask which command answers it **alone**. Severity is a factual claim and needs the
same proof as the defect. A human gate runs in its **own turn**, and you read the result before
emitting the action.

**How to check.**

- Presence of markup does not answer "who executes". A worktree listing does not answer "is it
  merged". A commit range does not answer "whose commit is this". A comment is the last source to
  trust - read the condition.
- One case reproducing a defect does not measure the **population** affected. Two separate
  questions, and the second is usually a cheap count you skipped for speed.
- Never chain verification and action when the action is irreversible or publishes. If it must be
  one command, the verification has to **abort on its own**, not merely print.
- A claim that something is **pending** needs the same proof as a claim that something is broken.
  One agent reported an exception as "awaiting approval" when it had been applied three days
  earlier, with the reason recorded and versioned, because it treated its memory of the session
  as the state of the system.
- Propagation has latency. A test that fails in the same turn a file was created does not prove a
  restart is required; wait a turn and test again before asserting a boot requirement.
- Before installing or copying anything, check the configuration. "It is not installed" is an
  absence claim, and the list of capabilities announced at the start of a turn may be a **delta**,
  not a complete inventory - one agent nearly created divergent copies of two files a package
  already managed.
- A wrong alarm costs twice: it sends the decision-maker to the wrong place and it dispatches
  agents to fix what is not broken. It disappears the moment somebody runs the right command, so
  the cost lands on your credibility.
- Read the CI status **per branch**. A run listing without a branch filter mixes branches, and the
  red runs from your own negative test appear as if they were production.

---

## 22. Ask what success means before optimizing

**Symptom.** Correct numbers, produced for three sessions, answering a question nobody asked.

**Cases.**

- A cost-of-context effort spent **3 sessions** measuring input tokens - baseline, compression
  proxies, plugin pruning - and produced correct numbers. In the fourth, the owner said the ruler
  had never been money: it was **selection quality**. The symptom that should have been read
  earlier: the two variables pointed in opposite directions on the same target, where the most
  expensive component (8,274 tokens) was also the largest body of capability installed. When
  optimizing a metric obviously destroys something the owner values, the metric is incomplete  - 
  it is not time to measure more precisely, it is time to ask.
- An instrument recorded rework, cost and domain, but not whether a task used a data connector,
  what its real target was, or whether the result was verifiable without human judgment. The hole
  only appeared when somebody tried to **decide something new** with the instrument that already
  existed. No log ever warned that fields were missing.
- Ten acceptance criteria were written for a "make the homepage feel more alive" request  - 
  amplitude tolerances, animation budget, load metric, contrast, reduced-motion, document height.
  The implementation passed **10 of 10**, QA cleared it, it shipped, and the owner's first
  reaction was **"did you change anything?"**. The net effect of the work was **less** movement:
  one new parallax wave against removing reveal animations from 19 elements and halving the
  travel on 12 more. Technically correct - there were genuinely two animation systems fighting  - 
  and the opposite of what was asked. None of the 10 criteria could detect it, because none
  measured what the eye sees.
- A numeric criterion said "scroll position unchanged (delta < 2px)" when filtering. It was
  reported as passing - measured with the page at the top of the section. Measured where the user
  actually is when they click (scrolled to the control, because you have to see it to click it),
  the same criterion fails: **+47px at one width, −140px at another** (measured), varying between
  runs.
- Twenty sessions, 60 commits, 8 spec blocks each closed with a measured number, QA approved,
  deploy verified live. The owner's verdict on seeing the page: *you replicated what was there,
  and what was there did not work*. **No measurement was wrong.** The framing was: every question
  was "does this section meet criterion §N?", never "should this section exist like this?". Four
  times, when the page did not meet a criterion, the recorded outcome was **amending the
  criterion** - each amendment with a good technical argument, and together they are the mechanism
  by which the ruler adjusts to what already exists and a redesign becomes a repaint. Two
  tell-tales: the navigation was never in any spec, only inherited; and the bad photographs were
  documented and closed by amending the document, because there was no replacement in the repo.
- A tool showed **27 runs in 22 days, all synthetic subjects**. The easy reading was no demand. It
  was no **wiring**: the served copy of the router did not list it; the source did. Grep on the
  source said "enabled", grep on the served copies said zero.

**Rule.** A correct number to the wrong question costs more than no number, because it looks like
progress and becomes the basis of a decision. Zero usage measures your own selection and the
wiring - never quality, never demand. A perceptual request needs a perceptual acceptance
criterion. A numeric criterion without a stated **condition of measurement** is not a criterion:
whoever implements it picks the condition, and picks the most convenient one, which is the one
that passes.

**How to check.**

- An effort spanning more than one session opens by declaring the objective function in one line,
  and what is the objective versus what is merely a constraint ("objective = adoption rate;
  constraint = startup budget under the ceiling"). Inherited a handoff without that line? Ask
  before dispatching the first measurement.
- Before using an existing instrument to decide something new, write the target question first and
  check field by field whether the instrument captures what the decision requires. An instrument
  that does not capture the deciding field decides nothing - it participates as partial evidence,
  and that has to be said in the report, not hidden behind a number answering another question.
- For a perceptual request, the acceptance criterion opens with a side-by-side the owner looks at.
  Technical numbers are guardrails (do not regress load time, do not break accessibility), never
  proof that the request was met. A small diff on a perceptual request is an alarm. And when the
  technical diagnosis (coherence, system, debt) diverges from the literal request, **say so before
  executing** rather than delivering coherence in place of what was asked.
- Write the condition next to the number ("with the page scrolled to the clicked element, at both
  widths"), and always prefer the condition of **use** over the condition of **test**. Evidence
  produced by whoever executed carries the same bias as their measuring position - in one case six
  screenshots were delivered as evidence and every one was a ~40px crop of the control bar, none
  showing the filtered list, which was the object of the change. Opening the artifact and looking
  remains the job of whoever dispatched.
- Watch for the framing failure: the criterion changes to describe what is there · the item closes
  without the screen changing · what improved is invisible to a visitor · no question in the whole
  effort is about what the page must **do**. When that pattern appears, stop measuring and bring
  back the question behind it - who arrives, what they are looking for, what the path to the goal
  is.
- Judge tools by nature and trigger, not by usage. Doctrine is judged by measured adherence, where
  zero usage **is** the defect; reference material is judged by answering when consulted, where
  zero usage is normal; an executor is judged by its declared boundary, where zero usage is a
  suspicion, not a verdict. Comparing one nature to another by the same number is a category
  error. Zero usage opens an investigation of wiring, never closes an effort - and the check runs
  on the **served copy**, because the source proves intent and the cache proves behavior.
- Uninstall only on redundancy proven by hash or bytes: same situation, same trigger, no
  difference in content. A similar name proves nothing.
- Before proposing that someone change a habit, **measure whose defect it is**. Mining ~600
  transcripts and classifying 25 real cases gave: 9 of going too far without confirming scope, 7
  of missing state only the human had, 3 of declaring done without verifying (measured). The
  categories a longer prompt would fix summed to at most 8 of 25, while a one-size rule would tax
  the 74% of short prompts that already work, and be abandoned within a week. The division that
  survived scrutiny: the system covers everything recoverable from disk; the human is only asked
  what is unrecoverable (intent, business constraint, who the client is, what must not change).
- A new rule or threshold is sized by measuring the **population before designing it**. One
  obvious-looking filter, measured against the real queue, would have rejected **10 of 13**
  approved records to close a gap with **zero** occurrences (measured). A rule without a
  denominator is a guess wearing the costume of rigor.
- Doctrine already written and already violated is not fixed by rewriting doctrine. One rule was
  in the memory file and failed three times with the same user complaint; the fix is a lock in the
  execution path, not another sentence.
- Before proposing a new process, read the decision that may already be recorded in the CI. One
  recommendation of branch protection had been recorded as impossible on the current plan **in a
  workflow comment 16 days earlier**, and the same repo already had three jobs of positive-assertion
  gates, stricter than what was being proposed. And a process with no named pain is ceremony: the
  question that collapsed it was *which concrete failure would this have prevented?* - answer,
  none. "I cannot think of one" is a valid answer and ends the proposal.
- There is a gate nobody writes: **does the reader understand this word?** A batch of outbound
  messages was built on a technical finding about each reader. They passed native-language
  review, a 7-item QA and a compliance gate. The owner blocked the send on reading them: too
  technical, the readers will not know what those terms mean. No gate measured the reader's
  comprehension. A technical finding is research **input**, never the text; if the term
  survives into the final sentence, the translation into a business consequence was not done.

---

## 23. A clean merge is not a correct merge

**Symptom.** Both sides merged with no conflict to resolve, and the local check you were told to
run came back green. Nothing asked for a decision, so nothing looked like a decision.

**Cases.**

- One branch added an entry to a map of names; the other branch added the file that entry refers
  to, in a directory the map mirrors. The two edits landed on different lines, so the merge was
  clean. The merged map held 16 keys for 17 files on disk (measured), and only a test comparing
  the map against the directory caught it.
- A second branch of the same repository registered a new component in a catalog without
  declaring it in the profile that enumerates the catalog. That merge was clean too, and the
  shared branch stayed red for 2h28 (measured) before anyone connected the failing assertion to
  the merge that caused it.

**Rule.** A conflict is textual overlap, not broken meaning. When one side adds an item to a list
and the other side adds the thing that item refers to, nothing overlaps and only a test that
compares the two can see it.

**How to check.**

- After merging, run every command the pipeline runs, not the one the handover document named.
  Read the pipeline definition to find out which those are: a repository often has two entry
  points with different coverage, and the one with the reassuring name may be the smaller of the
  two.
- Before trusting a clean merge, list the files both sides touched that enumerate something else:
  a map of names, a registry, an index, an enabled list. Compare the merged copy against what it
  enumerates.

---

## 24. The adapter fabricates the zero the instrument never measured

**Symptom.** The probe answered 200, the field arrived, the number is there. Nothing failed
anywhere, and the consumer states the absence as a fact.

**Cases.**

- A reader for a status probe wrote `sessions: typeof d.sessions === 'number' ? d.sessions : 0`.
  The guard ten lines above it refused the whole reading when two other counters were missing, on
  the stated grounds that a half-answered probe is a mute probe. The sentinel underneath it did
  the opposite for the third counter, and a field the probe never sent left the adapter stamped
  as a measurement.
- The same reader built its total with `runs = source.value.filter(isOk)`, dropping every
  unparseable record. Ten corrupt records and zero records produce the identical output, `total:
  0`, and the record count is what the consumer was told to trust. The consumer here was a small
  language model, which cannot audit the number it is handed and narrates it: 'nothing is
  running'.
- Both survived a review that read the code, and were caught only when a second reviewer was
  asked specifically whether the consumer could distinguish 'measured, and it was zero' from
  'could not measure'. Four mutations were then applied to the fixed code and each one brought
  down exactly one new test (measured).

**Rule.** A zero that the instrument never produced is worse than a broken instrument: the
failure is laundered into a measurement by the code in between, and no error survives to be
found.

**How to check.**

- Grep every adapter between an instrument and its consumer for `?? 0`, `: 0`, `|| 0` and
  `.filter(`. Each one is a place where a failure can become a number.
- A field the source did not send must be absent from the output, not defaulted; make it optional
  in the type instead of filling it with a sentinel.
- A discard has to be returned next to the count it reduced, so the consumer can say 'read N,
  could not read M' instead of asserting a total that is not the total.
- Ask of the consumer, not of the code: can it tell 'measured, and it was zero' from 'could not
  measure'? If the answer is no, the distinction does not exist, however carefully the code was
  written.

---

## 25. A mechanism that fits the delta is not the cause of the delta

**Symptom.** Two runs of the same measurement disagree, someone finds a mechanism big enough to
explain the gap, and the ticket records it. The numbers fit, so nobody opens the runs again.

**Case.**

- Two paid startup measurements of the same profile, on the same day, differed by 4,359 tokens
  (measured). A free local probe showed that switching the account connectors on moves about
  15,000 characters of prompt (measured), and the ticket recorded that the gap fit that regime.
  Three days later the init event of both runs was read: zero MCP servers in each (measured).
  What differed was the loaded set, one new built-in plugin, two more agents and a newer CLI
  version. The comparison was confounded from the start, and the regime never happened in either
  run.

**Rule.** Before naming a cause for the gap between two runs, prove the two runs loaded the same
thing; a mechanism that could explain the gap is a hypothesis until the runs show it happened.

**How to check.**

- Record, next to every measured number, the fingerprint of what the run loaded (version,
  plugins, servers, agents, tools), read from the run's own log and never declared by hand.
- When two runs disagree, diff the fingerprints first. If they differ, the pair is confounded and
  no single cause is supported.

---

## 26. The detector already collects the field and only lacks the verdict

**Symptom.** The ticket says the data still has to be collected, and whoever reads it budgets a
collector: new parsing, new storage, new plumbing. The collector is already there, filling a
variable nobody judges.

**Case.**

- A transcript classifier was reported as blind to what a delegation brief said. The field was
  being accumulated since a fix 19 days earlier (measured) and was already read by the verdict,
  but only to check presence. The missing piece was judging its content: 17 lines added, 7 of
  them code (measured), against a ticket written as if the data had to be collected first.

**Rule.** Collection without a verdict is the common case, so a missing verdict gets reported as
missing data.

**How to check.**

- Before budgeting "we need to collect X", search the collector for the field name. If it is
  already stored, the work is the judgment, not the plumbing.
- For each collected field, name the line that turns it into pass or fail. A field with no such
  line is being collected for nobody.

---

## The short version

If you only keep one line from each: zero is the only result a broken instrument and an empty
world produce identically · a zero that confirms you is the one to audit · a positive control
proves the instrument finds something, not that it finds the failing class · an exit code
measures termination · smoke measures response, not work · a signal proves execution only if it
could not exist without it · a detector that never accused anything is not evidence of health · a
negative test must fail for the reason you claim, and removing the guard is cheaper than
injecting a defect · measure effect, not declaration · the ruler must not live inside the system
measured · a detector's count is not a queue · fixtures must inherit the corpus's pathologies ·
the process loads the installed copy · a green suite does not prove the gate runs · a gate is a
positive assertion · a nonzero exit means "failed" or "never measured", and the output blurs them
· a number without its instrument is testimony · declared is not done · second-hand facts are
hypotheses · suspect your own instrument before the target · run the command that answers *that*
question · and ask what success means before you optimize anything · no conflict means no textual
overlap, not that the merged file still agrees with what it describes · a default value turns a
failed reading into a measured number · a mechanism that fits the gap is a hypothesis until both
runs show it happened · the field is already collected; what is missing is the verdict.
