import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

const checks = [
  ['color', 'colour'],
  ['colored', 'coloured'],
  ['colors', 'colours'],
  ['favorite', 'favourite'],
  ['favorites', 'favourites'],
  ['center', 'centre'],
  ['centered', 'centred'],
  ['centering', 'centring'],
  ['behavior', 'behaviour'],
  ['behaviors', 'behaviours'],
  ['organize', 'organise'],
  ['organized', 'organised'],
  ['organizing', 'organising'],
  ['customize', 'customise'],
  ['customized', 'customised'],
  ['initialization', 'initialisation'],
  ['initialize', 'initialise'],
  ['initialized', 'initialised'],
  ['artifact', 'artefact'],
  ['artifacts', 'artefacts'],
  ['license', 'licence'],
];

const ignoredDirectories = new Set(['.git', 'dist', 'node_modules', 'coverage']);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }

    if (shouldCheck(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldCheck(filePath) {
  const relativePath = path.relative(root, filePath);
  const extension = path.extname(filePath);

  if (extension === '.md') {
    return !relativePath.startsWith('node_modules/');
  }

  return relativePath.startsWith('src/') && ['.js', '.jsx'].includes(extension);
}

function extractMarkdownText(source) {
  return [{ offset: 0, text: source.replace(/```[\s\S]*?```/g, '') }];
}

function extractSourceText(source, filePath) {
  const snippets = [];
  const extension = path.extname(filePath);

  if (path.basename(filePath) === 'strings.js') {
    for (const match of source.matchAll(/(['"`])((?:\\.|(?!\1)[\s\S])*)\1/g)) {
      if (!match[2].includes('${')) {
        snippets.push({ offset: match.index, text: match[2] });
      }
    }
  }

  if (extension === '.jsx') {
    for (const match of source.matchAll(/>([^<>{}][^<>{}]*)</g)) {
      snippets.push({ offset: match.index + 1, text: match[1] });
    }

    const userTextAttributes =
      /(?:aria-label|title|alt|placeholder|helperText|label|message)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

    for (const match of source.matchAll(userTextAttributes)) {
      snippets.push({ offset: match.index, text: match[1] ?? match[2] });
    }
  }

  return snippets;
}

function lineNumber(source, offset) {
  return source.slice(0, offset).split('\n').length;
}

function findProblems(filePath, source) {
  const extension = path.extname(filePath);
  const snippets =
    extension === '.md' ? extractMarkdownText(source) : extractSourceText(source, filePath);
  const problems = [];

  for (const snippet of snippets) {
    for (const [term, replacement] of checks) {
      const expression = new RegExp(`\\b${term}\\b`, 'i');
      if (expression.test(snippet.text)) {
        problems.push({
          line: lineNumber(source, snippet.offset),
          term,
          replacement,
        });
      }
    }
  }

  return problems;
}

const files = await listFiles(root);
const failures = [];

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8');
  const problems = findProblems(filePath, source);

  for (const problem of problems) {
    failures.push(
      `${path.relative(root, filePath)}:${problem.line} uses "${problem.term}"; prefer "${problem.replacement}".`,
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
