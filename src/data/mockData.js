
const getDateFromDayOfYear = (dayOfYear) => {
    const date = new Date(2025, 0); // Start Jan 1st
    date.setDate(dayOfYear);
    return `${date.getMonth() + 1}.${date.getDate()}`;
};

// 37 Cycles + 1 Summary = 38 items
export const cycles = Array.from({ length: 38 }, (_, i) => {
    const id = i + 1;
    const isSummary = id === 38;
    const isLastCycle = id === 37;

    // Cycle Calculations
    const cycleIndex = i; // 0-based
    const startDayOfYear = (cycleIndex * 10) + 1;

    // Determine number of days in this cycle
    let daysCount = 10;
    if (isLastCycle) daysCount = 5; // Days 361-365
    if (isSummary) daysCount = 0;   // Summary has no days grid

    const endDayOfYear = startDayOfYear + daysCount - 1;

    // Generate formatted date strings
    const startDateStr = getDateFromDayOfYear(startDayOfYear);
    const endDateStr = getDateFromDayOfYear(endDayOfYear);

    return {
        id: id,
        theme: isSummary ? 'Year Summary' : (isLastCycle ? 'Season' : 'Season'),
        isSummary: isSummary,
        dateRange: isSummary ? 'End of Year' : `${startDateStr} - ${endDateStr}`,
        // Days generation
        days: Array.from({ length: daysCount }, (_, d) => {
            const currentDayOfYear = startDayOfYear + d;
            return {
                day: d + 1,
                date: getDateFromDayOfYear(currentDayOfYear),
                // Random status for demo
                status: Math.random() > 0.4 ? 'harvested' : 'withered',
                note: '',
            };
        }),
        focusTasks: [
            { id: 1, title: 'Plant Turnips', status: 'pending' },
            { id: 2, title: 'Clear Rocks', status: 'completed' },
            { id: 3, title: 'Buy Seeds', status: 'failed' },
        ],
        summaryNote: ''
    };
});
