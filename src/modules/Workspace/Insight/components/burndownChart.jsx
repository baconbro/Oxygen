import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { useWorkspace } from "../../../../contexts/WorkspaceProvider";
import { useGetSprints } from '../../../../services/sprintServices';
import { useGetBurndownData } from '../../../../services/insightServices';

const BurndownChart = () => {
    const { project } = useWorkspace();
    const { data: sprints } = useGetSprints(project?.spaceId, project?.org);
    const [selectedSprint, setSelectedSprint] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const chartContainerRef = useRef(null);
    
    // Set default to the most recent active sprint
    useEffect(() => {
        if (sprints && sprints.length > 0) {
            const currentDate = new Date();
            // Look for active sprints first
            const activeSprint = sprints.find(sprint => 
                new Date(sprint.startDate) <= currentDate && 
                new Date(sprint.endDate) >= currentDate
            );
            
            if (activeSprint) {
                setSelectedSprint(activeSprint.id);
            } else {
                // Otherwise use the most recently ended sprint
                const sortedSprints = [...sprints].sort(
                    (a, b) => new Date(b.endDate) - new Date(a.endDate)
                );
                if (sortedSprints[0]) {
                    setSelectedSprint(sortedSprints[0].id);
                }
            }
        }
    }, [sprints]);

    const { data: burndownData, isLoading, error } = useGetBurndownData(
        project?.spaceId, 
        project?.org,
        selectedSprint
    );

    useEffect(() => {
        if (error) {
            console.error("Burndown chart error:", error);
            setErrorMessage("Failed to load burndown data. Please try again later.");
        } else {
            setErrorMessage(null);
        }
    }, [error]);

    const handleSprintChange = (e) => {
        setSelectedSprint(Number(e.target.value));
    };

    const [chartOptions, setChartOptions] = useState({
        chart: {
            id: 'burndown-chart',
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: true,
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                format: 'dd MMM'
            }
        },
        yaxis: {
            title: {
                text: 'Story Points Remaining'
            },
            min: 0,
            tickAmount: 5, // Ensure a reasonable number of ticks
            labels: {
                formatter: function(val) {
                    return Math.round(val); // Round to whole numbers
                }
            },
            forceNiceScale: true // Force nice round numbers
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        colors: ['#F64E60', '#3699FF'], // Red for actual, blue for ideal
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            },
            y: {
                formatter: function(val) {
                    return Math.round(val * 10) / 10; // Show one decimal place in tooltip
                }
            }
        },
        dataLabels: {
            enabled: false
        }
    });
    
    const [series, setSeries] = useState([]);

    useEffect(() => {
        if (burndownData) {
            // Make sure the data arrays exist and have elements before using them
            const actualData = Array.isArray(burndownData.actual) ? burndownData.actual : [];
            const idealData = Array.isArray(burndownData.ideal) ? burndownData.ideal : [];
            
            // Round the y values for better display 
            const roundedActualData = actualData.map(point => [
                point[0], 
                Math.round(point[1] * 10) / 10 // Round to one decimal place
            ]);
            
            const roundedIdealData = idealData.map(point => [
                point[0], 
                Math.round(point[1] * 10) / 10 // Round to one decimal place
            ]);
            
            setSeries([
                {
                    name: 'Actual Remaining',
                    data: roundedActualData
                },
                {
                    name: 'Ideal Burndown',
                    data: roundedIdealData
                }
            ]);
        }
    }, [burndownData]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return <div className="alert alert-danger">{errorMessage}</div>;
    }

    return (
        <div className="burndown-chart-container" ref={chartContainerRef}>
            {sprints && sprints.length > 0 ? (
                <div className="mb-4">
                    <select 
                        className="form-select form-select-sm w-auto" 
                        value={selectedSprint || ''} 
                        onChange={handleSprintChange}
                    >
                        <option value="">Select Sprint</option>
                        {sprints.map(sprint => (
                            <option key={sprint.id} value={sprint.id}>
                                {sprint.name} ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="alert alert-info mb-4">
                    No sprints available. Create sprints to see burndown charts.
                </div>
            )}

            {selectedSprint && burndownData ? (
                <>
                    {burndownData.totalPoints > 0 ? (
                        <div style={{ width: '100%', height: '350px', maxWidth: '100%', overflow: 'hidden' }}>
                            <Chart
                                options={chartOptions}
                                series={series}
                                type="line"
                                height={350}
                                width="100%"
                            />
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            No story points found in this sprint. Add tickets with story points to see the burndown chart.
                        </div>
                    )}
                </>
            ) : (
                <div className="alert alert-warning">
                    {selectedSprint ? "Loading sprint data..." : "Select a sprint to view burndown chart"}
                </div>
            )}
        </div>
    );
};

export default BurndownChart;
