---
name: pr-review
description: Review a pull request with three parallel reviewers (bug-hunter, performance-reviewer, security-reviewer), then merge their findings into one report with a verdict and an analysis. Use when the user asks for a PR review.
argument-hint: "[pr-number]"
disable-model-invocation: true
allowed-tools: Bash(gh pr diff:*), Bash(gh pr view:*), Bash(git diff:*), Bash(git branch:*), Bash(mkdir -p .claude/tmp), Read, Grep, Glob
---
You run a pull request review. You do not review the code yourself.
Three reviewers find the problems. You collect, check, merge and analyze their findings.
You do not change code. You do not post to GitHub unless the user asks.

## Arguments
- `$0` is the PR number. It is optional.
- If `$0` is not a number, write "Usage: /pr-review [pr-number]" and stop.

## Step 1: Get the diff
1. Run `mkdir -p .claude/tmp`.
2. If you have a PR number:
   - Run `gh pr view $0 --json number,title,author,baseRefName,headRefName,additions,deletions,changedFiles`.
   - Run `gh pr diff $0 > .claude/tmp/pr-review.diff`.
3. If you have no PR number:
   - Run `git branch --show-current` to get the branch name.
   - Run `git diff main...HEAD > .claude/tmp/pr-review.diff`.
4. If a command fails, write the error and stop.
   For example: `gh` is not installed, you are not signed in, or the PR does not exist.
5. Read the diff file. If it is empty, write "No changes to review." and stop.
6. Make a list of the changed files from the `diff --git` lines.
7. If the diff has more than 3000 lines, tell the user. Continue, and write this in "Limits".

## Step 2: Start the reviewers
Start the three reviewers in one message, so they run in parallel:
bug-hunter, performance-reviewer and security-reviewer.
Send each reviewer this prompt, with the values filled in:

~~~
Review mode: diff file
Diff file: .claude/tmp/pr-review.diff
PR: #<number> <title> (<head branch> -> <base branch>)
Changed files:
<list of changed files>
Skip lock files and generated files.
Use your output format. Do not write other text.
~~~

Do not put the diff text in the prompt. Each reviewer reads the file.

## Step 3: Collect the results
1. Wait for all three reviewers.
2. For each reviewer, record one status:
   - OK: it returned findings or "No findings."
   - Failed: it returned an error or no result.
   - Bad format: its output does not use its format.
3. If a reviewer failed, do not start it again more than one time.
4. Never write findings for a reviewer that failed. Write the failure in "Limits".

## Step 4: Check each finding
1. Find the file in the list of changed files.
   If the file is not in the diff, move the finding to "Unverified".
2. For each High finding, read the line in the code.
   If the code does not agree with the finding, move it to "Unverified" and write why.
3. Do not change the severity of a reviewer finding, with one exception in Step 5.

## Step 5: Merge the findings
1. Find duplicates. Two findings are duplicates when:
   - they are in the same file,
   - their lines are 3 lines or less apart,
   - and they have the same cause.
2. Merge each set of duplicates into one finding:
   - Keep the highest severity.
   - Write the names of all reviewers that found it.
   - Keep all evidence lines (Trigger, Effect, Attacker).
3. Find conflicts. A conflict is two fixes that do not agree.
   For example: the performance-reviewer says "use Promise.all",
   and the bug-hunter says "these calls have a race condition".
   Do not choose a fix. Write the conflict in the analysis.
4. Sort the findings: High, then Medium, then Low.
   In each severity group, put security findings first, then bugs, then performance.

## Step 6: Give the verdict
Use the first rule that applies:
1. A reviewer failed → **Incomplete**. Do not approve.
2. One or more High findings → **Request changes**.
3. One or more Medium findings → **Approve with comments**.
4. Only Low findings, or no findings → **Approve**.

## Step 7: Write the analysis
Write facts from the findings only. Do not add new findings.
1. Risk: write one sentence for each review angle (bugs, performance, security).
2. Hotspots: write the files with two or more findings.
3. Patterns: write a cause that occurs two or more times.
   For example: "Three Server Actions do not check the caller."
4. Conflicts: write the conflicts from Step 5.
5. Limits: write what the review did not cover.
   For example: a failed reviewer, a very large diff, generated files, or no tests in the diff.
6. Fix order: write the order to fix the findings. Fix High security findings first.
   Put a fix first when other fixes depend on it.

## Output
Use this format. Write all of the sections.
If a section has no content, write "None."

~~~
# PR Review: #<number> <title>

**Verdict:** <Request changes | Approve with comments | Approve | Incomplete>
<one sentence that gives the main reason>

| Reviewer             | Status | High | Medium | Low |
|----------------------|--------|------|--------|-----|
| bug-hunter           | OK     | 0    | 0      | 0   |
| performance-reviewer | OK     | 0    | 0      | 0   |
| security-reviewer    | OK     | 0    | 0      | 0   |
| **Merged total**     |        | 0    | 0      | 0   |

## Findings

### High
1. `path/file.ts:42` [Category] - <problem>
   Found by: <reviewer names>
   <Trigger | Effect | Attacker>: <evidence>
   Fix: <one line>

### Medium
...

### Low
...

### Unverified
- `path/file.ts:10` [Category] - <problem> - Reason: <why it is unverified>

## Analysis
- **Risk:** bugs: <sentence>. Performance: <sentence>. Security: <sentence>.
- **Hotspots:** <files>
- **Patterns:** <patterns>
- **Conflicts:** <conflicts>
- **Limits:** <limits>

## Fix order
1. <finding number and a short reason>
2. ...
~~~

## After the report
Ask the user one question: "Do you want me to post this review on the PR?"
If the user says yes, run `gh pr review $0 --comment --body-file <file>`.
Do not use `--approve` or `--request-changes`. A person makes that decision.