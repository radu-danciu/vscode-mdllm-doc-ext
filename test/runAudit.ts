import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main(): Promise<void> {
  const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
  const extensionTestsPath = path.resolve(__dirname, 'runMocha.js');

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    extensionTestsEnv: {
      TEST_GROUPS: 'audit',
      AUDIT_PRINT_REPORT: process.argv.includes('--report') ? '1' : '0'
    },
    launchArgs: [extensionDevelopmentPath, '--disable-extensions']
  });
}

void main();
