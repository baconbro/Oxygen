import ReactApexChart from 'react-apexcharts';
import { useWorkspace } from '../../../../contexts/WorkspaceProvider';
import { calculateSprintMetrics } from '../../../../utils/sprintMetrics';
import { useGetSprints } from '../../../../services/sprintServices';

const VelocityChart = () => {
  const { project } = useWorkspace();
  const { data: sprints } = useGetSprints(project.spaceId, project.org);
  const doneColumnId = project?.config?.board?.doneColumn;

  if (!sprints || sprints.length === 0) {
    return <div className="alert alert-info">No sprint data available</div>;
  }

  const sprintMetrics = calculateSprintMetrics(sprints, project.issues,doneColumnId);
  
  const chartData = {
    series: [
      {
        name: 'Committed Story Points',
        data: sprintMetrics.map(sprint => sprint.committed)
      },
      {
        name: 'Completed Story Points',
        data: sprintMetrics.map(sprint => sprint.completed)
      }
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: sprintMetrics.map(sprint => sprint.name),
      },
      yaxis: {
        title: {
          text: 'Story Points'
        }
      },
      fill: {
        opacity: 1,
        colors: ['#3699FF', '#1BC5BD'] // Blue for committed, Green for completed
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' points'
          }
        }
      },
      legend: {
        position: 'top',
      }
    },
  };

  return (
    <div className="velocity-chart-container">
      {!sprints || sprints.length === 0 ? (
        <div className="alert alert-info">No sprint data available</div>
      ) : (
        <div className="chart-container" style={{ width: '100%', maxWidth: '100%', height: '350px', overflow: 'hidden' }}>
          <ReactApexChart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={350}
            width="100%"
          />
        </div>
      )}
    </div>
  );
};

export default VelocityChart;