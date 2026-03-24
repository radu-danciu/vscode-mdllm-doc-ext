export class BaseVector {}

export class Vector extends BaseVector {
  public length(): number {
    return 1;
  }
}

export function normalize(value: number): number {
  return value;
}

export function undocumented(value: number): number {
  return value * 2;
}
