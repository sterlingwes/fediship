const formatter = new Intl.NumberFormat();

export const thousandsNumber = (value: number) => {
  return formatter.format(value);
};
