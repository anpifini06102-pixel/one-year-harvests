
// Mocking dateUtils logic locally to test it (since we can't easily import ES modules in bare node without type:module)
const getDayOfYear = (date = new Date()) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

const getCurrentCycle = (date = new Date()) => {
    const dayOfYear = getDayOfYear(date);

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

console.log("Testing dateUtils...");
try {
    const res = getCurrentCycle();
    console.log("getCurrentCycle result:", res);
} catch (e) {
    console.error("getCurrentCycle failed:", e);
}

console.log("Testing mockData logic...");
try {
    const cycles = Array.from({ length: 38 }, (_, i) => {
        const id = i + 1;
        return { id };
    });
    console.log("Cycles created:", cycles.length);
} catch (e) {
    console.error("mockData generation failed:", e);
}
