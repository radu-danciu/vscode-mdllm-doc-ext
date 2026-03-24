export class ShowcaseCounter {
  increment(value) {
    return value + 1;
  }
}

export const ShowcaseMath = {
  normalize(value) {
    return Math.abs(value);
  }
};

const counter = new ShowcaseCounter();
counter.increment(1);
ShowcaseMath.normalize(-3);
