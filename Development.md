# Development based on the version forked from Google

1. Clone the project codebase
2. cd geminit-cli
3. nstall and build everything in order
   ```bash
   npm install
   npm run build --workspaces
   ```

# Syncing the fork with the **upstream**

It ensures that your copy stays up to date with the latest features and bug fixes from the main project. Here is the step-by-step process to set this up and maintain it.

---

## 1. Set Up the Upstream Remote

By default, your fork only knows about your own version on GitHub (`origin`). You need to tell your local git that the original repository exists.

1. Open your terminal in your project folder.
2. Add the original repository as a new remote named **upstream**:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/ORIGINAL_REPOSITORY.git

```


3. Verify your remotes:
```bash
git remote -v

```


You should see `origin` (your fork) and `upstream` (the original).

---

## 2. The Syncing Workflow

Whenever you want to pull in the latest changes from the original project, follow these steps:

### Step A: Fetch the changes

This downloads the data from the original repo without changing your local files yet.

```bash
git fetch upstream

```

### Step B: Merge the changes

Switch to your local main branch (usually `main` or `master`) and merge the upstream version into it.

```bash
git checkout main
git merge upstream/main

```

*Note: If you have made local changes to the main branch, you might encounter merge conflicts here that you'll need to resolve.*

### Step C: Push to your GitHub fork

Now that your local machine is updated, push those changes back to your GitHub profile.

```bash
git push origin main

```

---

## 3. The "Easy Way" (GitHub Web Interface)

If you don't want to use the command line for a quick update:

1. Navigate to **your fork** on GitHub.com.
2. Look for the **"Sync fork"** button (usually right below the green "Code" button).
3. Click **Update branch**.

> **Tip:** While the web interface is faster, using the command line (Step 2) is better for your workflow because it ensures your local development environment is also in sync, preventing "diverged branch" errors later.

---

## Pro Tip: Use Rebase for a Cleaner History

If you are working on a feature branch and want to pull in the latest updates from the original project without creating "merge commits," use **rebase**:

```bash
git checkout my-feature-branch
git fetch upstream
git rebase upstream/main

```
