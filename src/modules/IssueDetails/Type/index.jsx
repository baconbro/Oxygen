import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select } from '../../../components/common';

import { TypeButton, Type, TypeLabel } from './Styles';

import { useWorkspace } from '../../../contexts/WorkspaceProvider';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const ProjectBoardIssueDetailsType = ({ issue, updateIssue }) => {

  const { project } = useWorkspace();
  const [convertedData, setConvertedData] = useState({});


  // transform data to meet 1.0 requirement
  const convertDataFormat = (originalData) => {
    const convertedData = {};

    Object.values(originalData).forEach(item => {
      convertedData[item.id] = item.name;  // Keeps the 'type' prefix in keys
    });

    return convertedData;
  };

  useEffect(() => {
    const newData = convertDataFormat(project.config.issueType);
    setConvertedData(newData);
  }, [project.config.issueType]);

  const findColorById = (id) => {
    for (const key in project.config.issueType) {
      if (project.config.issueType[key].id === id) {
        return project.config.issueType[key].color;
      }
    }
    return null; // Return null if no matching id is found
  };
  const findIconById = (id) => {
    for (const key in project.config.issueType) {
      if (project.config.issueType[key].id === id) {
        return project.config.issueType[key].icon;
      }
    }
    return null; // Return null if no matching id is found
  };



  return (
    <Select
      variant="empty"
      dropdownWidth={150}
      withClearValue={false}
      name="type"
      value={issue.type}
      options={Object.entries(convertedData).map(([type, label]) => ({
        value: type,
        label: label,
      }))}
      onChange={type => updateIssue({ type })}
      renderValue={({ value: type }) => (
        <TypeButton variant="empty" icon={<i className={`bi bi-${findIconById(type)}`} style={{ color: findColorById(type) }}></i>} className="btn">
          {convertedData[type]}
        </TypeButton>
      )}
      renderOption={({ value: type }) => (
        <Type key={type} onClick={() => updateIssue({ type })}>
          <i className={`bi bi-${findIconById(type)}`} style={{ color: findColorById(type) }}></i>
          <TypeLabel>{convertedData[type]}</TypeLabel>
        </Type>
      )}
    />)
};

ProjectBoardIssueDetailsType.propTypes = propTypes;

export default ProjectBoardIssueDetailsType;
