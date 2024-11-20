const findAvailableParameters = (issues) => {
    const availableParameters = {};
    const excludedParams = [
        "projectId", 
        "id", 
        "comments", 
        "description",
        "budgetEstimate",
        "budgetRemaining",
        "budgetSpent",
        "createdAt",
        "listPosition",
        "parent",
        "progress",
        "status",
        "timeRemaining",
        "timeSpent",
        "updatedAt",
        "tags",
        "title"
    ]; // Exclude these parameters

    issues.forEach(issue => {
        Object.keys(issue).forEach(key => {
            if (!availableParameters[key] && !excludedParams.includes(key)) { 
                availableParameters[key] = new Set(); 
            }
            if (!excludedParams.includes(key)) {
                availableParameters[key].add(issue[key]);
            }
        });
    });
        // Sort the keys alphabetically
        const sortedParameters = Object.keys(availableParameters).sort();

        // Create a new object with the order preserved
        const orderedParameters = {};
        sortedParameters.forEach(key => {
            orderedParameters[key] = availableParameters[key];
        });
    
        return orderedParameters;
}

export default findAvailableParameters; 