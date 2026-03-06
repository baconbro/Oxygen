import React, { useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import { getCSSVariableValue } from '../../utils';


const KrGraph = ({ className, chartColor, chartHeight, kr }) => {
  const chartRef = useRef(null);
  const data = kr.updates ? kr.updates.map(update => [update.createdAt, Number(update.newScore) || 0]) : [];

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = new ApexCharts(chartRef.current, getChartOptions(chartColor, chartHeight, kr));
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [chartRef, kr.updates, chartColor, chartHeight]);

  return (
    <div className={`card ${className}`}>
      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-10">
            <i className="bi bi-graph-up fs-2x text-gray-400 mb-3"></i>
            <div className="text-gray-500">Add an update to see the progress graph</div>
          </div>
        ) : (
          <div ref={chartRef} className="mixed-widget-5-chart card-rounded-top"></div>
        )}
      </div>
    </div>
  );
};

const getChartOptions = (chartColor, chartHeight, kr) => {
  const labelColor = getCSSVariableValue('--bs-gray-800');
  const strokeColor = getCSSVariableValue('--bs-gray-300');
  const baseColor = getCSSVariableValue('--bs-' + chartColor);
  const lightColor = getCSSVariableValue('--bs-' + chartColor);

  const maxScore = Math.max(Number(kr.score) || 0, Number(kr.targetValue) || 0) * 1.1;
  const data = kr.updates ? kr.updates.map(update => [update.createdAt, Number(update.newScore) || 0]) : [];

  return {
    series: [
      {
        name: 'Score',
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
        filter: { type: 'none', value: 0 },
      },
      hover: {
        filter: { type: 'none', value: 0 },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: { type: 'none', value: 0 },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val) {
          const unit = kr.mesureAs === 'dollar' ? '$' : kr.mesureAs === 'percent' ? '%' : '';
          return kr.mesureAs === 'dollar' ? `${unit}${val}` : `${val}${unit}`;
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
