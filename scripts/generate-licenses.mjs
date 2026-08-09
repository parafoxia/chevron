// SPDX-FileCopyrightText: 2026 Ethan Henderson
//
// SPDX-License-Identifier: MIT OR Apache-2.0

/**
 * Generates the third-party attribution notice bundled with Chevron.
 *
 * Sources:
 *   - npm     package-lock.json, production closure, as installed on disk
 *   - cargo   `cargo about generate` for the target being built
 *   - manual  attributions/manifest.json, for things in neither lockfile
 *
 * Output: src-tauri/resources/THIRD-PARTY-LICENSES.txt
 *
 * The output is deterministic -- it carries no timestamp and everything is
 * sorted -- so two runs over the same inputs produce identical bytes.
 *
 * Usage: node scripts/generate-licenses.mjs [--strict]
 *
 * Strict mode (implied by CI=true) turns warnings into failures, so a release
 * can never ship a dependency we could not attribute.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src-tauri", "resources", "THIRD-PARTY-LICENSES.txt");

const STRICT =
  process.argv.includes("--strict") || process.env.CI === "true";

const LICENSE_FILE = /^(LICEN[SC]E|COPYING|COPYRIGHT|UNLICENSE)/i;
const NOTICE_FILE = /^(NOTICE|THIRD.?PARTY)/i;

const warnings = [];

function warn(message) {
  warnings.push(message);
  console.warn(`  ! ${message}`);
}

/** Fatal in strict mode, a warning otherwise. */
function softFail(message) {
  if (STRICT) fail(message);
  warn(message);
}

function fail(message) {
  console.error(`\nerror: ${message}`);
  process.exit(1);
}

// --- shared -----------------------------------------------------------------

/** Content-addressed store of licence texts, keyed by hash. */
const texts = new Map();

function normalise(text) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

/** Interns a licence text and returns its hash, or null if the text is empty. */
function intern(raw, spdx, kind) {
  const text = normalise(raw);
  if (!text) return null;

  const hash = createHash("sha256").update(text).digest("hex").slice(0, 16);
  if (!texts.has(hash)) texts.set(hash, { spdx, kind, text });
  return hash;
}

const packages = [];

function addPackage(pkg) {
  packages.push({ notes: [], texts: [], ...pkg });
}

/**
 * Reads licence and notice files sitting directly in a package directory.
 * `kinds` selects which of the two to collect.
 */
function scanDir(dir, spdx, kinds = ["license", "notice"]) {
  const found = [];
  let entries;

  try {
    entries = readdirSync(dir);
  } catch {
    return found;
  }

  for (const entry of entries.sort()) {
    const kind = LICENSE_FILE.test(entry)
      ? "license"
      : NOTICE_FILE.test(entry)
        ? "notice"
        : null;
    if (!kind || !kinds.includes(kind)) continue;

    const path = join(dir, entry);
    try {
      if (!statSync(path).isFile()) continue;

      const hash = intern(readFileSync(path, "utf8"), spdx, kind);
      if (hash) found.push(hash);
    } catch {
      // Broken symlink or unreadable file; checkGaps reports the package if
      // this leaves it with no text at all.
    }
  }

  return found;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

// --- npm --------------------------------------------------------------------

/**
 * Walks package-lock.json for the production closure.
 *
 * The lockfile rather than `npm ls` because it is deterministic, needs no
 * subprocess, and does not invent phantom nodes for unmet optional peers.
 * Entries not present on disk are skipped: they are platform-specific
 * optional packages that this build does not ship.
 */
function collectNpm() {
  const lock = readJson(join(ROOT, "package-lock.json"));
  let count = 0;

  for (const [key, entry] of Object.entries(lock.packages ?? {})) {
    if (!key || entry.dev || entry.devOptional || entry.link) continue;

    const dir = join(ROOT, key);
    if (!existsSync(join(dir, "package.json"))) continue;

    const manifest = readJson(join(dir, "package.json"));
    const spdx = entry.license ?? manifest.license ?? null;

    addPackage({
      id: `npm:${manifest.name}@${manifest.version}`,
      ecosystem: "npm",
      name: manifest.name,
      version: manifest.version,
      spdx: typeof spdx === "string" ? spdx : (spdx?.type ?? null),
      repository: repositoryUrl(manifest.repository) ?? manifest.homepage,
      texts: scanDir(dir, typeof spdx === "string" ? spdx : null),
    });
    count += 1;
  }

  console.log(`  npm    ${count} packages`);
}

function repositoryUrl(repository) {
  const url = typeof repository === "string" ? repository : repository?.url;
  if (!url) return null;

  return url
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git:\/\//, "https://");
}

// --- cargo ------------------------------------------------------------------

/**
 * The triple this build targets. Tauri's CLI exports TAURI_ENV_TARGET_TRIPLE
 * to beforeBuildCommand, which is how the two macOS matrix legs each attribute
 * their own target. Outside a Tauri build we fall back to the host.
 */
function targetTriple() {
  if (process.env.TAURI_ENV_TARGET_TRIPLE) {
    return process.env.TAURI_ENV_TARGET_TRIPLE;
  }

  const rustc = spawnSync("rustc", ["-vV"], { encoding: "utf8" });
  const host = rustc.stdout?.match(/^host: (.+)$/m);
  if (!host) fail("could not determine the host target triple from `rustc -vV`");

  return host[1].trim();
}

function collectCargo() {
  const target = targetTriple();

  const result = spawnSync(
    "cargo",
    ["about", "generate", "--format", "json", "--locked", "--target", target],
    {
      cwd: join(ROOT, "src-tauri"),
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    },
  );

  if (result.error?.code === "ENOENT") {
    softFail(
      "cargo-about is not installed; Rust crates are missing from this notice. " +
        "Install it with `cargo install cargo-about` or from " +
        "https://github.com/EmbarkStudios/cargo-about/releases",
    );
    return;
  }

  if (result.status !== 0) {
    softFail(
      `cargo-about exited with ${result.status}; Rust crates are missing from ` +
        `this notice.\n${result.stderr?.trim()}`,
    );
    return;
  }

  const about = JSON.parse(result.stdout);

  // licences[] gives each text once, plus the crates using it. Invert it so we
  // can attach texts to crates rather than the other way round.
  const byCrate = new Map();
  for (const licence of about.licenses) {
    const hash = intern(licence.text, licence.id, "license");
    if (!hash) continue;

    for (const { crate } of licence.used_by) {
      const key = `${crate.name}@${crate.version}`;
      if (!byCrate.has(key)) byCrate.set(key, []);
      byCrate.get(key).push(hash);
    }
  }

  for (const { package: crate, license } of about.crates) {
    const key = `${crate.name}@${crate.version}`;
    const found = byCrate.get(key) ?? [];

    // cargo-about does not collect NOTICE files, but Apache-2.0 s4(d) requires
    // them to travel with the work.
    const notices = crate.manifest_path
      ? scanDir(dirname(crate.manifest_path), license, ["notice"])
      : [];

    addPackage({
      id: `cargo:${key}`,
      ecosystem: "cargo",
      name: crate.name,
      version: crate.version,
      spdx: license ?? crate.license ?? null,
      repository: crate.repository ?? crate.homepage,
      texts: [...new Set([...found, ...notices])],
    });
  }

  console.log(`  cargo  ${about.crates.length} crates (${target})`);
}

// --- manual -----------------------------------------------------------------

/** Attributions for things in neither lockfile, e.g. webfonts. */
function collectManual() {
  const manual = readJson(join(ROOT, "attributions", "manifest.json"));

  for (const entry of manual.packages) {
    const text = readFileSync(join(ROOT, entry.textFile), "utf8");

    addPackage({
      id: `other:${entry.name}`,
      ecosystem: "other",
      name: entry.name,
      version: entry.version ?? null,
      spdx: entry.spdx ?? null,
      repository: entry.repository ?? null,
      notes: entry.notes ?? [],
      texts: [intern(text, entry.spdx, "license")].filter(Boolean),
    });
  }

  console.log(`  manual ${manual.packages.length} entries`);
  return manual.allowMissingText ?? [];
}

// --- gaps -------------------------------------------------------------------

/**
 * Packages that ship no licence text still have to be attributed. Known cases
 * are allowlisted in attributions/manifest.json (a trailing `*` matches a
 * prefix, for families of per-platform binaries); anything new fails the build
 * in strict mode rather than shipping unnoticed.
 */
function checkGaps(allowed) {
  const gaps = packages.filter((pkg) => pkg.texts.length === 0);

  for (const pkg of gaps) {
    pkg.notes.push(
      "This package is distributed without a licence file. Its declared " +
        "licence is shown above; the full text is available from its " +
        "repository.",
    );
  }

  const unexpected = gaps.filter(
    (pkg) =>
      !allowed.some((pattern) =>
        pattern.endsWith("*")
          ? pkg.name.startsWith(pattern.slice(0, -1))
          : pkg.name === pattern,
      ),
  );
  if (unexpected.length === 0) return;

  softFail(
    `${unexpected.length} package(s) ship no licence text and are not ` +
      `allowlisted in attributions/manifest.json:\n` +
      unexpected.map((pkg) => `      ${pkg.id} (${pkg.spdx})`).join("\n"),
  );
}

// --- output -----------------------------------------------------------------

const RULE = "=".repeat(80);
const THIN = "-".repeat(80);

function render() {
  const sorted = [...packages].sort(
    (a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()) ||
      a.ecosystem.localeCompare(b.ecosystem) ||
      String(a.version).localeCompare(String(b.version)),
  );

  // Group by licence text so the hundreds of identical Apache-2.0 and MIT
  // copies collapse into one block each.
  const users = new Map();
  for (const pkg of sorted) {
    for (const hash of pkg.texts) {
      if (!users.has(hash)) users.set(hash, []);
      users.get(hash).push(pkg);
    }
  }

  const sections = [...users.keys()].sort((a, b) => {
    const x = texts.get(a);
    const y = texts.get(b);
    return (
      String(x.spdx).localeCompare(String(y.spdx)) ||
      x.kind.localeCompare(y.kind) ||
      a.localeCompare(b)
    );
  });

  const out = [];

  out.push(RULE);
  out.push("Chevron - Third-Party Software Notices");
  out.push(RULE);
  out.push("");
  out.push(
    "Chevron itself is licensed under MIT OR Apache-2.0, at your option. This",
  );
  out.push(
    "file covers the third-party software distributed with Chevron, and is",
  );
  out.push("generated from package-lock.json and Cargo.lock at build time.");
  out.push("");
  out.push(`Components:    ${sorted.length}`);
  out.push(`Licence texts: ${sections.length}`);

  if (warnings.length > 0) {
    out.push("");
    out.push("This notice is INCOMPLETE. Generation reported:");
    for (const message of warnings) {
      out.push(
        ...message
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `  - ${line.trim()}`),
      );
    }
  }

  out.push("");
  out.push("");
  out.push(RULE);
  out.push("1. COMPONENTS");
  out.push(RULE);
  out.push("");

  for (const pkg of sorted) {
    const version = pkg.version ? ` ${pkg.version}` : "";
    out.push(`  [${pkg.ecosystem}] ${pkg.name}${version} - ${pkg.spdx ?? "see below"}`);
    if (pkg.repository) out.push(`            ${pkg.repository}`);
    for (const note of pkg.notes) {
      out.push(...wrap(note, 12));
    }
  }

  out.push("");
  out.push("");
  out.push(RULE);
  out.push("2. LICENCE TEXTS");
  out.push(RULE);

  for (const hash of sections) {
    const entry = texts.get(hash);
    const label = entry.kind === "notice" ? "NOTICE" : (entry.spdx ?? "Licence");

    out.push("");
    out.push(THIN);
    out.push(label);
    out.push("");
    out.push("Applies to:");
    for (const pkg of users.get(hash)) {
      out.push(`  ${pkg.name}${pkg.version ? ` ${pkg.version}` : ""}`);
    }
    out.push(THIN);
    out.push("");
    out.push(entry.text);
    out.push("");
  }

  return `${out.join("\n")}\n`;
}

function wrap(text, indent) {
  const width = 80 - indent;
  const pad = " ".repeat(indent);
  const lines = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(pad + line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(pad + line);

  return lines;
}

// --- main -------------------------------------------------------------------

console.log(`Generating third-party notices${STRICT ? " (strict)" : ""}...`);

collectNpm();
collectCargo();
const allowMissingText = collectManual();
checkGaps(allowMissingText);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, render());

console.log(
  `  wrote  ${packages.length} components, ${texts.size} texts -> ` +
    `src-tauri/resources/THIRD-PARTY-LICENSES.txt`,
);
