import React, { useEffect, useState } from 'react';
import { useWorkspace } from "../../../../contexts/WorkspaceProvider";
import Chart from 'react-apexcharts';
import { useGetCumulativeFlowData } from '../../../../services/insightServices';

const CumulativeFlowChart = () => {
    const { project } = useWorkspace();
    const [chartOptions, setChartOptions] = useState({
        chart: {
            id: 'cumulative-flow-chart',
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: true,
            },
            stacked: true,
        },
        xaxis: {
            type: 'datetime',
            categories: [],
        },
        yaxis: {
            title: {
                text: 'Number of Tasks'
            },
        },
        stroke: {
            curve: 'smooth',
            width: 0,
        },
        fill: {
            type: 'solid',
            opacity: 0.8,
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#6993FF', '#FFA800', '#F64E60', '#1BC5BD']
    });
    
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Get the cumulative flow data - make sure we're passing the correct project data
    const { data: flowData, isLoading, error } = useGetCumulativeFlowData(
        project?.spaceId, 
        project?.org, 
        project?.issues?.length ? [{...project.issues[0], config: project.config}] : []
    );

    // Map status IDs to names for better readability
    const getStatusName = (statusId) => {
        if (!project?.config?.issueStatus) return statusId;
        
        const status = project.config.issueStatus.find(status => status.id === statusId);
        return status ? status.name : statusId;
    };

    useEffect(() => {
        if (!isLoading && flowData) {
            console.log("Flow data received:", flowData); // Debug log
            
            // Update chart options with real dates
            setChartOptions(prev => ({
                ...prev,
                xaxis: {
                    ...prev.xaxis,
                    categories: flowData.categories.map(date => new Date(date).getTime())
                }
            }));
            
            // Update series with real data and status names
            const mappedSeries = flowData.series.map(series => ({
                name: getStatusName(series.name),
                data: series.data
            }));
            
            console.log("Mapped series:", mappedSeries); // Debug log
            setSeries(mappedSeries);
            setLoading(false);
        }
    }, [flowData, isLoading, project]);

    return (
        <div className="cumulative-flow-chart-container">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">Error loading chart data</div>
            ) : (
                <div className="chart-container" style={{ width: '100%', maxWidth: '100%', height: '350px', overflow: 'hidden' }}>
                    <Chart
                        options={chartOptions}
                        series={series}
                        type="area"
                        height={350}
                        width="100%"
                    />
                </div>
            )}
        </div>
    );
};

export default CumulativeFlowChart;
