const calculateGroupByValue = (issue, groupBy) => {
    const dateValue = issue[groupBy]; 
    // Handle "No Date"
    if (!dateValue) return "No Date"; 

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const tomorrow = new Date(today); 
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This Week
    const thisWeekStart = new Date(today);
    const thisWeekEnd = new Date(today);
    while (thisWeekStart.getDay() !== 1) { 
        thisWeekStart.setDate(thisWeekStart.getDate() - 1);
    }
    while (thisWeekEnd.getDay() !== 0) {
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 1);
    }

    // Next Week
    const nextWeekStart = new Date(thisWeekEnd); 
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6); 

    // This Month
    const thisMonthStart = new Date(today);
    thisMonthStart.setDate(1); // First day of the month
    const thisMonthEnd = new Date(today);
    thisMonthEnd.setMonth(thisMonthEnd.getMonth() + 1, 0); // Last day of the month

    // This Quarter
    const thisQuarterStart = new Date(today);
    thisQuarterStart.setMonth(Math.floor(today.getMonth() / 3) * 3, 1); // First day of quarter
    const thisQuarterEnd = new Date(thisQuarterStart);
    thisQuarterEnd.setMonth(thisQuarterEnd.getMonth() + 3, 0); // Last day of quarter

    const issueDate = new Date(dateValue);

    if (issueDate >= today && issueDate < tomorrow) {
        return "Today";
    } else if (issueDate >= tomorrow && issueDate < tomorrow.setDate(tomorrow.getDate() + 1)) {
        return "Tomorrow";
    } else if (issueDate >= thisWeekStart && issueDate <= thisWeekEnd) {
        return "This Week";
    } else if (issueDate >= nextWeekStart && issueDate <= nextWeekEnd) { 
        return "Next Week";
    } else if (issueDate >= thisMonthStart && issueDate <= thisMonthEnd) { 
        return "This Month";
    } else if (issueDate >= thisQuarterStart && issueDate <= thisQuarterEnd) { 
        return "This Quarter";
    } else {
        return "Later"; 
    }
};


export default calculateGroupByValue