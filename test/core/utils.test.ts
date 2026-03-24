import * as assert from 'assert';
import { truncateMarkdown } from '../../src/core/utils';

suite('utils', () => {
  test('preserves blank lines between markdown sections in hover previews', () => {
    const preview = truncateMarkdown(
      ['Brief: One line summary.', '', 'Details:', 'More detail here.', '', 'Returns:', 'A value.'].join(
        '\n'
      ),
      7
    );

    assert.strictEqual(
      preview,
      ['Brief: One line summary.', '', 'Details:', 'More detail here.', '', 'Returns:', 'A value.'].join(
        '\n'
      )
    );
  });
});
