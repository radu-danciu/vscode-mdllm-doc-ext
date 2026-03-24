import * as fs from 'fs';
import * as path from 'path';
import Mocha from 'mocha';
import { captureWorkspaceConfiguration, restoreWorkspaceConfiguration } from './helpers';

export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 20000 });
  const groups = (process.env.TEST_GROUPS ?? 'integration')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  for (const group of groups) {
    const directory = path.resolve(__dirname, group);
    for (const file of collectTestFiles(directory)) {
      mocha.addFile(file);
    }
  }

  await captureWorkspaceConfiguration();

  try {
    await new Promise<void>((resolve, reject) => {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} test(s) failed.`));
          return;
        }
        resolve();
      });
    });
  } finally {
    await restoreWorkspaceConfiguration();
  }
}

function collectTestFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectTestFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      result.push(fullPath);
    }
  }

  return result;
}
