# Contributing Guide

Welcome to the team! This guide outlines our development workflow and coding standards to help keep our repository clean, organized, and easy to maintain. Please follow these steps for all contributions.

---

## Quick Start Workflow

Follow these 6 steps for every task you work on:

1. Clone / Pull Latest ➔ 2. Create Branch ➔ 3. Work & Commit ➔ 4. Sync Main ➔ 5. Push Branch ➔ 6. Open PR

---

## 🛠️ Step-by-Step Instructions

### 1. Clone the Repository

If you haven't already, clone the repository to your local machine and navigate into the project directory:

```bash
git clone https://github.com/iotb-tech/group-3-booknest.git
cd group-3-booknest
```

### 2. Create a Feature or Fix Branch

Always pull the latest changes from the main branch before creating your working branch.

```bash
git checkout main
git pull origin main
```

Create a new branch using a prefix that describes your task (feat/, fix/, chore/, docs/):

```bash
# For new features
git checkout -b feat/your-branch-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation or chores
git checkout -b chore/chore-description
```

### 3. Make Changes and Commit in Stages

Break your work down into small, logical parts. Review your changes and stage them cleanly before committing.

```bash
# Check what files you changed
git status

# Stage specific files (avoid using `git add .` blindly)
git add path/to/file.js
```

Write your commit message using Conventional Commits (all lowercase summary):

```bash
git commit -m "feat: commit message goes here"
```

**Commit Message Conventions**

We enforce standard commit prefixes so our project history remains readable:

- `feat:` A new feature or capability
- `fix:` A bug fix
- `chore:` Changes to build tools, dependencies, or configuration
- `docs:` Documentation changes only
- `refactor:` Code changes that neither fix a bug nor add a feature

### 4. Sync with Main Before Pushing

Before sending your code to GitHub, ensure your local branch includes any new updates your teammates might have merged while you were working:

```bash
# Pull the latest changes from main into your current branch
git pull origin main
```

**If there are any merge conflicts, resolve them locally in your IDE and commit the resolution before proceeding.**

### 5. Push to Your Remote Branch

Push your completed task and commit history up to GitHub:

```bash
git push origin your-branch-name
```

### 6. Create a Pull Request (PR)

1. Go to the repository on GitHub.
2. Click the "Compare & pull request" button that appears at the top of the page.
3. Write a clear title and description explaining what your code changes accomplish.
4. Submit the PR.

---

## Review and Merge Policy

- Code Review: All PRs must be reviewed by the Team Lead or designated reviewer.
- Merging: Once your PR passes review, it will be merged into the `main` branch by the Team Lead. **Do not merge your own PR.**

> Thank you for following these guidelines and helping keep our codebase healthy!
