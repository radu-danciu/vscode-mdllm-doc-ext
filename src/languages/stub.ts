import { ResolvedSymbol } from '../core/types';

export function createDefaultStub(symbol: ResolvedSymbol): string {
  const lines: string[] = [
    `### \`${symbol.canonicalSignature}\``,
    '',
    'Brief: TODO',
    '',
    'Details:',
    'TODO',
    ''
  ];

  if (symbol.kind === 'type' || symbol.kind === 'object') {
    if (symbol.inheritanceChain && symbol.inheritanceChain.length > 0) {
      lines.push('Inheritance:');
      lines.push('');
      for (const item of symbol.inheritanceChain) {
        lines.push(`- \`${item}\``);
      }
      lines.push('');
    }

    if (symbol.frozenTypeArguments && symbol.frozenTypeArguments.length > 0) {
      lines.push('Template Arguments:');
      lines.push('');
      for (const item of symbol.frozenTypeArguments) {
        lines.push(`- \`${item.name} = ${item.value}\``);
      }
      lines.push('');
    }
  } else {
    if (symbol.params && symbol.params.length > 0) {
      lines.push('Params:');
      lines.push('');
      for (const param of symbol.params) {
        lines.push(`- \`${param.name}\`: TODO`);
      }
      lines.push('');
    }

    if (symbol.returnType && symbol.returnType !== 'void' && symbol.returnType !== 'None') {
      lines.push('Returns:');
      lines.push('TODO');
      lines.push('');
    }
  }

  lines.push('---', '');
  return lines.join('\n');
}
