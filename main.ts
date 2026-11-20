// Golden Hour Cover Lab — entrypoint for the make.fun grader.
//
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with the kit library. The output directory is treated as
// a place we only ever write into: it is created with mkdirSync and
// files are copied over it. Nothing here ever deletes the output
// directory (or anything inside it) — on the grader /output is a mount
// point and deleting it fails, so we simply never clean it.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

function copyTreeIfPresent(sourceName, targetName) {
  const source = join(repoRoot, sourceName);
  if (!existsSync(source)) return;
  const target = join(outputDir, targetName);
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function handInEntry() {
  mkdirSync(outputDir, { recursive: true });
  copyTreeIfPresent('app', 'app');
  copyTreeIfPresent('screenshots', 'screenshots');
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handInEntry();
