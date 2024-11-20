import React, { useEffect, useState } from "react";
import Chart from 'react-apexcharts'
import { 
  getItemsByPriority
 } from "../../../modules/alpha1/App/services/firestore";
 import { useAuth } from "../../../modules/auth";
 import { IssuePriority } from "../../../modules/alpha1/shared/constants/issues";
 import { issuePriorityColors } from "../../../modules/alpha1/shared/utils/styles";

const ChartItemByPriority = () => {
  const [series, setSeries] = useState([{
    data: []
  }]);
  const [labels, setLabels] = useState([]);
  const { currentUser } = useAuth();
    const idr = currentUser?.all.currentOrg ?? currentUser?.orgs[0]
    const priorities = Object.values(IssuePriority); 

  useEffect(() => {
    

    getItemsByPriority(idr, priorities).then(counts => {
      // Convert the counts object to the format needed by ApexCharts
      setSeries([{
        data: Object.values(counts)
      }]);
      setLabels(Object.keys(counts));
    });
  }, []);

  const options = {
    chart: {
      type: 'bar'
    },
    plotOptions: {
      bar: {
        horizontal: false
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: labels
    },
  };

  return (<>
      <div className="card ">
      {/* begin::Header */}
      <div className='card-header border-0 pt-5'>
        {/* begin::Title */}
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>By priority</span>
        </h3>
        {/* end::Title */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body'>
        {/* begin::Chart */}
        <Chart options={options} series={series} type="bar" />
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div></>);
};

export default ChartItemByPriority;
