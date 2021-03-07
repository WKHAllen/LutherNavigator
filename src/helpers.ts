export const helpers = {
  is: (a: any, b: any, options: any) => {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  lessThan: (a: any, b: any, options: any) => {
    if (a < b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  lessThanEqual: (a: any, b: any, options: any) => {
    if (a <= b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  greaterThan: (a: any, b: any, options: any) => {
    if (a > b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  greaterThanEqual: (a: any, b: any, options: any) => {
    if (a >= b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
};
