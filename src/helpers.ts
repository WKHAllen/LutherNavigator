export const helpers = {
  is: (a: any, b: any, options: any) => {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
};
