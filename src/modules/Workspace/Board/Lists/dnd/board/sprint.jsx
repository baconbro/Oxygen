const SprintToolBar = ({ sprint }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };
    const calculatePercentage = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const remainingDays = (end - today) / (1000 * 60 * 60 * 24);
        return Math.max(0, 100 - Math.min(100, (remainingDays / totalDays) * 100));
    };

    const calculateWeekdaysRemaining = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        let count = 0;
        for (let d = today; d <= end; d.setDate(d.getDate() + 1)) {
            const day = d.getDay();
            if (day !== 0 && day !== 6) { // Exclude Sundays (0) and Saturdays (6)
                count++;
            }
        }
        return count;
    };

    const percentage = calculatePercentage(sprint.startDate, sprint.endDate);
    const weekdaysRemaining = calculateWeekdaysRemaining(sprint.startDate, sprint.endDate);



    return (
        <>
            <div className="app-toolbar py-3 text-white" style={{ backgroundColor: '#003049' }}>
                <div className="app-container  container-fluid d-flex flex-stack ">
                    <div className="d-flex align-items-center me-5">
                        <div className="d-flex align-items-center flex-shrink-0">
                            <span className="fs-7  fw-bold pe-3 d-none d-md-block">Sprint Name : {sprint.name}</span>
                        </div>
                        <div className="d-flex align-items-center flex-shrink-0">
                            <div className="bullet bg-secondary h-35px w-1px mx-5"></div>
                            <span className="fs-7  fw-bold pe-4 ps-1 d-none d-md-block">Goal : {sprint.goal}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center" >
                        
                        <span className="fs-7  fw-bold pe-4 ps-1 d-none d-md-block">From : {formatDate(sprint.startDate)}</span>
                        <div className="me-3" >
                        </div>
                        <div className="progress w-100px w-xl-150px w-xxl-300px h-25px bg-light-success">
                            <div className="progress-bar rounded bg-success fs-7 fw-bold" style={{ width: `${percentage}%` }}>
                                {weekdaysRemaining} days remaining
                            </div>
                        </div>
                        <div className="m-0">
                            <span className="fs-7  fw-bold pe-4 ps-1 d-none d-md-block">To : {formatDate(sprint.endDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default SprintToolBar;