// Copy the question bank from content/ into the web app (falls back to the bundled sample).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../content/questions/questions.json");
const target = resolve(here, "../src/data/questions.json");
const sample = resolve(here, "../src/data/questions.sample.json");

mkdirSync(dirname(target), { recursive: true });
if (existsSync(source)) {
  copyFileSync(source, target);
  console.log(`[sync-data] questions.json <- ${source}`);
} else if (!existsSync(target)) {
  copyFileSync(sample, target);
  console.warn("[sync-data] content/questions/questions.json not found, using sample questions");
}
