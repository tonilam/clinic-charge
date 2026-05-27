---
name: commit
description: Creates git commits for working files using conventional commit format. Use when the user asks to commit changes, create a git commit, or as step 3 of the development runbook.
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git diff *)
---

**Git Commit**

- Create a git commit for the working files
- Use `{type}({subtype}): {message}` for the commit title
- a descriptive summary within 200 words for the commit body
