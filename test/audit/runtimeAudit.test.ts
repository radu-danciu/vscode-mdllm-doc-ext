import * as assert from 'assert';
import { configureWorkspace } from '../helpers';
import {
  formatRuntimeAuditDiagnostics,
  runRuntimeAudit,
  RuntimeAuditDiagnostic
} from './runtimeAudit';

suite('runtime audit', () => {
  suiteSetup(async () => {
    await configureWorkspace({
      codeRoot: '.',
      docsRoot: 'docs/api'
    });
  });

  test('pairs audited runtime symbols with mirrored docs through DocIndex.findEntry', async () => {
    const result = await runRuntimeAudit();
    if (process.env.AUDIT_PRINT_REPORT === '1') {
      console.log(formatRuntimeAuditDiagnostics(result));
      console.log('audit_keys:');
      for (const diagnostic of result.diagnostics) {
        console.log(formatDiagnosticForAssertion(diagnostic));
      }
    }

    assert.deepStrictEqual(
      result.diagnostics.map(formatDiagnosticForAssertion),
      [],
      `Unexpected runtime audit mismatches:\n${formatRuntimeAuditDiagnostics(result)}`
    );
  });
});

function formatDiagnosticForAssertion(diagnostic: RuntimeAuditDiagnostic): string {
  return [
    diagnostic.category,
    diagnostic.sourceRelativePath ?? '(no source)',
    diagnostic.codeSignature ?? diagnostic.documentedSignature ?? '(unknown symbol)'
  ].join(':');
}
