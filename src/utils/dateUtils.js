export const getDayOfYear = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getCurrentCycle = (date = new Date()) => {
  const dayOfYear = getDayOfYear(date);

  // Days 1-360 mapped to Cycles 1-36
  // Days 361-365(366) mapped to Cycle 37

  if (dayOfYear > 360) {
    return {
      cycle: 37,
      day: dayOfYear - 360
    };
  }

  const cycle = Math.ceil(dayOfYear / 10);
  const day = (dayOfYear - 1) % 10 + 1;

  return { cycle, day };
};
