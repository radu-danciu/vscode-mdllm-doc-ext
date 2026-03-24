export interface ShowcaseRenderer {
  render(title: string): string;
}

export type ShowcaseStatus = 'ready' | 'done';

export class ShowcaseVector implements ShowcaseRenderer {
  constructor(private readonly value: number) {}

  public magnitude(): number {
    return Math.abs(this.value);
  }

  public render(title: string): string {
    return `${title}:${this.magnitude()}`;
  }
}

export function normalizeShowcase(value: number): number {
  return Math.abs(value);
}

/**
 * Source-comment-only sample used to verify fallback hover behavior when no mirrored markdown
 * entry exists for the symbol.
 */
export function builtinCommentShowcase(name: string): string {
  return `builtin:${name}`;
}

const renderer = new ShowcaseVector(-4);
renderer.render('typescript');
normalizeShowcase(-8);
builtinCommentShowcase('typescript');
