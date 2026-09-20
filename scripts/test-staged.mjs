import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const vitestBin = path.resolve(process.cwd(), "node_modules/vitest/vitest.mjs");

// Find all test spec files in the repository
function getAllSpecFiles() {
  try {
    const output = execSync('git ls-files "*.spec.ts" "*.spec.tsx"', {
      encoding: "utf8",
    });
    return output
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && fs.existsSync(s));
  } catch {
    return [];
  }
}

// Map modified files to domain test suites if direct related test graph is empty
function findFallbackTests(stagedFiles, allSpecs) {
  const selected = new Set();

  for (const file of stagedFiles) {
    const lower = file.toLowerCase();

    // Products domain
    if (lower.includes("product")) {
      allSpecs
        .filter((s) => s.toLowerCase().includes("product"))
        .forEach((s) => selected.add(s));
    }

    // Auth / Login domain
    if (lower.includes("auth") || lower.includes("login")) {
      allSpecs
        .filter(
          (s) =>
            s.toLowerCase().includes("auth") ||
            s.toLowerCase().includes("login") ||
            s.toLowerCase().includes("require-role")
        )
        .forEach((s) => selected.add(s));
    }

    // Orders domain
    if (lower.includes("order")) {
      allSpecs
        .filter((s) => s.toLowerCase().includes("order"))
        .forEach((s) => selected.add(s));
    }

    // Verification / Documents domain
    if (lower.includes("doc") || lower.includes("verif")) {
      allSpecs
        .filter(
          (s) =>
            s.toLowerCase().includes("verification") ||
            s.toLowerCase().includes("file-validation")
        )
        .forEach((s) => selected.add(s));
    }

    // Shared UI components
    if (lower.includes("packages/ui")) {
      allSpecs
        .filter((s) => s.startsWith("packages/ui"))
        .forEach((s) => selected.add(s));
    }

    // Seller app fallback
    if (lower.startsWith("apps/seller/")) {
      allSpecs
        .filter((s) => s.startsWith("apps/seller/"))
        .slice(0, 3)
        .forEach((s) => selected.add(s));
    }
  }

  return Array.from(selected);
}

function main() {
  // 1. Get staged code files
  let stagedFiles = [];
  try {
    const raw = execSync(
      "git diff --cached --name-only --diff-filter=ACMR",
      { encoding: "utf8" }
    );
    stagedFiles = raw
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => /\.(ts|tsx|js|jsx)$/i.test(s));
  } catch (err) {
    console.error("Failed to inspect staged files:", err.message);
    process.exit(0);
  }

  if (stagedFiles.length === 0) {
    console.log("No code files staged. Skipping unit tests.");
    process.exit(0);
  }

  console.log(`Analyzing tests for ${stagedFiles.length} staged code file(s)...`);

  // 2. Try direct vitest related
  const relatedRun = spawnSync(
    process.execPath,
    [vitestBin, "related", "--run", "--passWithNoTests", ...stagedFiles],
    {
      encoding: "utf8",
      env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "true" },
    }
  );

  const stdout = relatedRun.stdout || "";
  const stderr = relatedRun.stderr || "";

  if (relatedRun.status !== 0) {
    if (stdout) console.error(stdout);
    if (stderr) console.error(stderr);
    console.error("\n[GenZ Pre-Commit] Related unit tests failed for modified files.");
    process.exit(relatedRun.status || 1);
  }

  // Check if any tests were actually executed
  const ranTests =
    stdout.includes("Test Files") && !stdout.includes("No test files found");

  if (ranTests) {
    console.log(stdout.trim());
    process.exit(0);
  }

  // 3. If no direct tests were found (e.g. UI/presentation layout edits), run domain test fallback
  console.log(
    "Modified files contain UI / presentation layers with no direct unit imports."
  );
  console.log("Running domain feature test suites for affected areas...\n");

  const allSpecs = getAllSpecFiles();
  const fallbackTests = findFallbackTests(stagedFiles, allSpecs);

  if (fallbackTests.length === 0) {
    console.log("No matching domain test suites found. Quality gate passed.");
    process.exit(0);
  }

  console.log(`Executing ${fallbackTests.length} relevant test suite(s):`);
  fallbackTests.forEach((t) => console.log(`  • ${t}`));
  console.log("");

  const fallbackRun = spawnSync(
    process.execPath,
    [vitestBin, "run", ...fallbackTests],
    {
      stdio: "inherit",
      env: { ...process.env, VITE_CONFIG_NATIVE_IGNORE_WARNING: "true" },
    }
  );

  if (fallbackRun.status !== 0) {
    console.error(
      "\n[GenZ Pre-Commit] Domain feature tests failed for modified areas."
    );
    process.exit(fallbackRun.status || 1);
  }
}

main();
