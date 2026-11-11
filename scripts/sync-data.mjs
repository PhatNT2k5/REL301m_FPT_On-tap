// Copy the question bank (and its translations) from content/ into the web app.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../../content/questions");
const dataDir = resolve(here, "../src/data");

mkdirSync(dataDir, { recursive: true });

const questionsSource = resolve(contentDir, "questions.json");
const questionsTarget = resolve(dataDir, "questions.json");
if (existsSync(questionsSource)) {
  copyFileSync(questionsSource, questionsTarget);
  console.log(`[sync-data] questions.json <- ${questionsSource}`);
} else if (!existsSync(questionsTarget)) {
  copyFileSync(resolve(dataDir, "questions.sample.json"), questionsTarget);
  console.warn("[sync-data] content/questions/questions.json not found, using sample questions");
}

const translationsSource = resolve(contentDir, "translations.json");
const translationsTarget = resolve(dataDir, "translations.json");
if (existsSync(translationsSource)) {
  copyFileSync(translationsSource, translationsTarget);
  console.log(`[sync-data] translations.json <- ${translationsSource}`);
} else if (!existsSync(translationsTarget)) {
  writeFileSync(translationsTarget, "{}\n");
  console.warn("[sync-data] content/questions/translations.json not found, questions will show in their original language");
}
