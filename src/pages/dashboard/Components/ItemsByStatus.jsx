import React, { useEffect, useState } from "react";
import Chart from 'react-apexcharts'
import {getItemsByStatus} from "../../../modules/alpha1/App/services/firestore";
 import { useAuth } from "../../../modules/auth";
 import { IssueStatus } from "../../../modules/alpha1/shared/constants/issues";
 import { useWorkspace } from "../../../contexts/WorkspaceProvider";

const ChartItemByStatus = () => {
  const [series, setSeries] = useState([]);
  const [labels, setLabels] = useState([]);
  const { currentUser } = useAuth();
    const idr = currentUser?.all.currentOrg ?? currentUser?.orgs[0]
    const {project} = useWorkspace()
        //  Extract values from the issueStatus object
//const issueStatusValues = Object.values(project.config.issueStatus);

// Create an array of names
//const names = issueStatusValues.map(status => status.name);
//console.log(names)

  useEffect(() => {
    const statuses = Object.values(IssueStatus); 

    getItemsByStatus(idr, statuses).then(counts => {
      // Convert the counts object to the format needed by ApexCharts
      setSeries(Object.values(counts));
      setLabels(Object.keys(counts));
    });
  }, []);

  const options = {
    labels: labels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (<>
      <div className="card ">
      {/* begin::Header */}
      <div className='card-header border-0 pt-5'>
        {/* begin::Title */}
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>By status</span>
        </h3>
        {/* end::Title */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body'>
        {/* begin::Chart */}
        <Chart options={options} series={series} type="pie" />
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div></>);
};

export default ChartItemByStatus;
