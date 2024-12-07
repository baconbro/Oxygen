import PropTypes from 'prop-types';
import { Select } from '../../../components/common';
import { Status } from './Styles';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useGetWorkPackages } from '../../../services/workPackageServices';
import { useAuth } from '../../auth';
import { useEffect, useState } from 'react';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const PackageDetail = ({ issue, updateIssue }) => {
  const { project } = useWorkspace()
  const { currentUser } = useAuth();
  const [wpgData, setWpgData] = useState([]);
  const { data: wpgDatas, status, error } = useGetWorkPackages(project.spaceId, currentUser?.all?.currentOrg);

  useEffect(() => {
    if (wpgDatas) {
      setWpgData(wpgDatas);
    }
  }, [wpgDatas]);

  return (
    <>
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="wpkg"
        value={issue.wpkg}
        options={wpgData.map(wpkg => ({
          value: wpkg.title,
          label: wpkg.title,
        }))}
        onChange={wpkg => updateIssue({ wpkg })}
        renderValue={({ value }) => (
          <Status isValue className={`btn`}>
            <div>{value}</div>
            <i className='bi bi-chevron-down'></i>
          </Status>
        )}
        renderOption={({ value }) => (
          <Status className={`btn`} >{value}</Status>
        )}
      />

    </>
  )
};

PackageDetail.propTypes = propTypes;

export default PackageDetail;
