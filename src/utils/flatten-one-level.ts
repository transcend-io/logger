const { flat } = Array.prototype;

export const flattenOneLevel = (flat as undefined | typeof flat)
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (list: any[]) => list.flat(1)
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (list: any[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list.reduce((acc: any[], val: any[]) => acc.concat(val), []);
