---
description: Review your own production runs for failed, slow and expensive work, and open pull requests on your own repository that fix what repeats. Load this when a scheduled review fires or a maintainer asks for one.
---

# Self review

## Read

1. List the last 7 days of runs with `vercel__list_agent_runs` (`period: '7d'`, `pageSize: 100`). List the 7 days before them with `from` and `to`, to compare.
2. Pick three groups of up to three runs: runs that failed or never answered, the slowest runs, and the runs that used the most tokens. To compare how long runs took, read their lifecycle events with `vercel__get_agent_run`.
3. Read each picked run with `vercel__get_agent_run_trace`. A trace can come in pages: while the response has a `later` cursor, fetch the next page. An empty trace doesn't mean the run did nothing. Look for:
   - a tool call that failed and was retried with the same input
   - the same tool called several times in one turn, such as paging through a list or a log
   - a tool output much larger than the answer needed
   - a question to the person that your instructions already answer
4. Read `vercel__get_runtime_errors` for the same 7 days, and look inside a growing error with `vercel__get_runtime_logs`.

## Decide

A finding is a pattern seen in at least two runs, with a cause you can name and one change that addresses it. The change goes in a file you already have: `agent/instructions.md`, an option in `agent/extensions/github.ts`, or a new skill under `agent/skills/`. A pattern seen in one run is not a finding. Keep at most three findings, the strongest first.

## Open

Before opening anything, list your open pull requests on `agent/` branches. Skip a finding an open pull request already covers.

For each finding, call `editFiles` once, on your own repository:

- `branch`: `agent/` followed by a short name for the change, such as `agent/ci-failure-context`, with `baseBranch` set to the default branch
- `edits`: the smallest change that addresses the finding
- `pullRequest`: `draft: true`, a title that says what changes, and a body with the numbers, the run IDs, the cause, and what a reviewer should check

Quote run IDs and tool names, never what a person wrote. Never merge, and never open a pull request on another repository.

## Report

Reply with this week's run count, failures and token usage next to last week's, then one line per pull request with its link. When nothing repeats, reply in one line that the week was clean, and open nothing.
