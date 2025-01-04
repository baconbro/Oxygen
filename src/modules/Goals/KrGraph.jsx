import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../utils';


const KrGraph = ({ className, chartColor, chartHeight, kr }) => {
  const chartRef = useRef(null);
  const data = kr.updates ? kr.updates.map(update => [update.createdAt, Number(update.newScore) || 0]) : [];

  const refreshChart = () => {
    if (!chartRef.current) {
      return;
    }

    const chart = new ApexCharts(chartRef.current, chartptions(chartColor, chartHeight, kr));
    if (chart) {
      chart.render();
    }

    return chart;
  };

  useEffect(() => {
    const chart = refreshChart();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRef]);

  return (
    <div className={`card ${className}`}>
      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="no-data-message">Add update before viewing progress graph</div>
        ) : (
          <div ref={chartRef} className="mixed-widget-5-chart card-rounded-top"></div>
        )}
      </div>
    </div>
  );
};

const chartptions = (chartColor, chartHeight, kr) => {
  const labelColor = getCSSVariableValue('--bs-gray-800');
  const strokeColor = getCSSVariableValue('--bs-gray-300');
  const baseColor = getCSSVariableValue('--bs-' + chartColor);
  const lightColor = getCSSVariableValue('--bs-' + chartColor);

  const maxScore = Math.max(Number(kr.score) || 0, Number(kr.targetValue) || 0) * 1.1;

  const data = kr.updates ? kr.updates.map(update => [update.createdAt, Number(update.newScore) || 0]) : [];

  const startDate = new Date(kr.start * 1000);
  const endDate = new Date(kr.end * 1000);
  const numberOfWeeks = Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000));

  const categories = Array.from({ length: numberOfWeeks }, (_, i) => `Week ${i + 1}`);

console.log(data)
  return {
    series: [
      {
        name: '',
        data: data,
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      height: chartHeight,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {},
    legend: {
      show: true,
    },
    dataLabels: {
      enabled: true,
    },
    fill: {
      type: 'gradient',
      opacity: 1,
    },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: [baseColor],
    },
    xaxis: {
        type: 'datetime',
      //categories: categories,
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      labels: {
        show: true,
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
      crosshairs: {
        show: false,
        position: 'front',
        stroke: {
          color: strokeColor,
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      min: 0,
      max: maxScore,
      labels: {
        show: true,
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val) {
          return kr.mesureAs + ' ' + val  ;
        },
      },
    },
    colors: [lightColor],
    markers: {
      colors: [lightColor],
      strokeColors: [baseColor],
      strokeWidth: 3,
    },
  };
};

export default KrGraph;