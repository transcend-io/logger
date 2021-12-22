const { flat } = Array.prototype;

export const flattenOneLevel = (flat as undefined | typeof flat)
  ? (list: any[]) => list.flat(1)
  : (list: any[]) =>
      list.reduce((acc: any[], val: any[]) => acc.concat(val), []);
