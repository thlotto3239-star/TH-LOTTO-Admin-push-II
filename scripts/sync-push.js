/**
 * Continuous Deployment Helper Script for TH-LOTTO-Admin
 * Syncs changes from UI Admin into the standalone GitHub deploy repo and pushes directly.
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_DIR = path.resolve(__dirname, "../..");
const SOURCE_DIR = path.resolve(__dirname, "..");
const DEPLOY_DIR = path.resolve(ROOT_DIR, "temp_admin_repo");

const commitMsg = process.argv.slice(2).join(" ") || `feat(admin): sync live updates ${new Date().toISOString()}`;

if (!fs.existsSync(DEPLOY_DIR)) {
  console.error("Deploy directory temp_admin_repo does not exist.");
  process.exit(1);
}

// Copy items
const exclude = new Set([
  ".next",
  "node_modules",
  ".env",
  ".env.local",
  ".git",
  ".zscripts",
  "tsconfig.tsbuildinfo",
  "download",
  "tool-results",
  "worklog.md",
  "audit"
]);

const items = fs.readdirSync(SOURCE_DIR);

for (const item of items) {
  if (exclude.has(item)) continue;
  const src = path.join(SOURCE_DIR, item);
  const dest = path.join(DEPLOY_DIR, item);
  fs.cpSync(src, dest, { recursive: true, force: true });
}

// Git commit & push
console.log("📦 Staging, committing and pushing to TH-LOTTO-Admin-push...");
execSync(`git add -A`, { cwd: DEPLOY_DIR, stdio: "inherit" });
try {
  execSync(`git commit -m "${commitMsg}"`, { cwd: DEPLOY_DIR, stdio: "inherit" });
  execSync(`git push origin master`, { cwd: DEPLOY_DIR, stdio: "inherit" });
  console.log("✅ Successfully deployed to GitHub TH-LOTTO-Admin-push!");
} catch (e) {
  console.log("Nothing to commit or already up to date.");
}
