# Relais, the delivery chain

A feature or a fix goes through six stages, one after the other. Each stage is **analysed by an agent, then
corrected**, and the next agent starts from the **reports of all the previous ones**. Trigger phrase: "lance le
Relais sur #N" (or "run the Relais on #N").

The coordinator (the main session, see `CLAUDE.md`) runs the chain, checks the evidence and keeps the chain log.
Agents are the shared ones of `movrack/AI`; nothing here duplicates their rules.

## Stages

| # | Stage | Agent | Input | Output | Then |
|---|---|---|---|---|---|
| 0 | **Implementation** | a coding agent (worktree when other work is running) | the issue and its final decisions, `AGENTS.md`, `GLOSSARY.md` | code, tests, docs; `tsc`, `vitest`, `pytest` green | stage 1 |
| 1 | **Capture** | `parker` | the implementation report | screenshots (360 px, light and dark, all states) and `INDEX.md` | stage 2 |
| 2 | **Novice review** | `mamy` | the captures and the stage 0 report | report ranked Blocker, Major, Minor | **corrections**, then new captures if the UI changed |
| 3 | **Accessibility** | `ally` | the captures, the reports of `mamy` and of the corrections | report with the WCAG 2.2 criterion and the fix | **corrections**, then new captures if the UI changed |
| 4 | **Translations** | `c3po` | all previous reports and the final texts | keys, placeholders, meaning in every language | **corrections** (translation files and texts only) |
| 5 | **Performance** | `chrono` (`opus`) | the final code (it does not need the earlier reports) | measured complexity and gains | **corrections** only for measured gains |

After stage 5: full checks (`tsc`, `vitest`, `pytest`, build), optional mutation run (`stryker`) on the new code,
then commit and push. **A deploy is never part of the chain**: it waits for an explicit request.

## Rules of the chain

- **Sequential.** One stage at a time, so each agent judges the code the previous corrections produced.
- **Each agent reads the earlier reports.** The coordinator gives every agent the paths of all previous reports
  (stages 2 to 4) and asks it to say which earlier findings are fixed, still open or contradicted.
- **Corrections after each analysis.** A correction agent fixes the Blocker and Major findings, and the Minor ones
  that are cheap and safe. A finding that changes a recorded decision, or that needs a product choice, goes to the
  owner instead of being fixed silently; a rejected finding is noted with the reason.
- **Gate.** A stage ends when no Blocker or Major is open. At most **two correction rounds** per stage; after
  that the coordinator reports to the owner.
- **The UI changed? Capture again.** Stages 2 and 3 need captures of the code as it is now, not of an earlier state.
- **Evidence.** After every correction the coordinator runs the checks itself; an agent's claim is not enough.
- **Chain log.** `reports/ai/relais/YYYY-MM-DD-<subject>.md` (git-ignored): one row per stage (agent, report path,
  verdict, open findings, corrections made, commit). It lets a new session resume at the right stage.
- **Cost.** At most two heavy agents at the same time; short reports; reuse an agent with `SendMessage` rather
  than starting a new one for the same work.
- **Protections.** Never bypass a hook (no other binary to dodge it); commit hours of public repositories apply;
  no real instance is touched; no production deploy without the owner's explicit request.

## Cost rules (retrospective of 2026-11-12)

Measured on #51 to #55: the chain is worth it for risky or user-visible work, and wasteful for small changes.
- **Light chain by default.** Run only the stages that can find something:
  - backend only (engine, API, storage): implementation, `nemesis` on the code, `c3po` on texts, `chrono`; no `parker`, `mamy`, `ally`;
  - card only: all stages except `chrono` unless a render path, a loop or a data structure changed;
  - texts or format only (#53-like): `parker` on the changed states only, `mamy`, `c3po`; `chrono` only if a measured hot path is touched.
  A skipped stage is written in the chain log with the reason.
- **Chrono stays on `opus` but is conditional.** On #51, #52, #53 and #54 it changed nothing (each run 60 to 120k tokens); on #55 it gained 18x. Run it when the change adds a sort, a loop over programs or devices, a cache key, a timer or a per-render computation.
- **Do not resume a fat agent.** A resumed agent replays its whole context: the coding agent grew from 119k to 278k tokens across 12 correction rounds. Reuse an agent only while its context is small (about 100k); after that start a fresh agent with a precise brief (files, finding list, report path).
- **One correction round per stage by default.** Batch every finding of the stage (Blocker, Major, cheap Minor) in one message; the second round only for a Blocker or Major still open.
- **Parker shoots only what changed**: the changed states at 360 px, both themes only when colours or contrast are involved, one language unless texts changed; no 1440 px. Cap the matrix (about 20 images); an image nobody opens is waste.
- **Max one `opus` agent at a time and at most two agents in parallel.** Three heavy agents (including two `opus`) hit the 5-hour limit on 2026-11-12 around 08:10, and the chain stopped for about 2.5 hours.
- **Short briefs and reports.** The brief states files, scope, owner decisions not to touch, the report path and a line limit; the reply is 8 to 15 lines; the long text goes in the report file. The coordinator does not re-paste a report, it gives the verdict and the owner decisions.
- **The coordinator checks cheaply**: `tsc` and `vitest` once per stage; the full `pytest` once before the commit, not after each agent.

## Chain log template

```
# Relais: <subject> (#N)
| Stage | Agent | Report | Verdict | Open | Corrections | Commit |
|---|---|---|---|---|---|---|
| 0 Implementation | | | | | | |
| 1 Capture | parker | | | | | |
| 2 Novice review | mamy | | | | | |
| 3 Accessibility | ally | | | | | |
| 4 Translations | c3po | | | | | |
| 5 Performance | chrono | | | | | |
```
