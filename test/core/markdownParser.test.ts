import * as assert from 'assert';
import { parseMarkdownEntries } from '../../src/core/markdownParser';

suite('markdownParser', () => {
  test('parses file metadata and multiple symbol entries', () => {
    const parsed = parseMarkdownEntries(
      [
        '# src/example.ts',
        '',
        '## Example',
        '',
        'Brief: One',
        '',
        '---',
        '',
        '## example(name: string) -> string',
        '',
        'Brief: Two'
      ].join('\n'),
      (signature) => signature.toLowerCase()
    );

    assert.strictEqual(parsed.sourceRelativePath, 'src/example.ts');
    assert.strictEqual(parsed.entries.length, 2);
    assert.strictEqual(parsed.entries[0].signature, 'Example');
    assert.strictEqual(parsed.entries[0].normalizedSignature, 'example');
    assert.strictEqual(parsed.entries[1].headingLine, 8);
    assert.match(parsed.entries[1].body, /Brief: Two/);
  });
});
