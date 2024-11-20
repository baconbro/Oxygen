import { useState, useEffect } from 'react';
import Create from './Create';
import ProjectBoardIssueDetailsDelete from '../Delete';
import { Link } from "react-router-dom";
import { issueTypeColors } from '../../../utils/styles';
import { useAuth } from '../../auth';
import Status from '../Status';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useUpdateItem } from '../../../services/itemServices';




const SubsComponent = ({ issue, updateIssue }) => {
  const { project } = useWorkspace();
  const [childList, setChildList] = useState([])
  const { currentUser } = useAuth();
  const editItemMutation = useUpdateItem();

  useEffect(() => {
    refreshData()
  }, []);

  const refreshData = () => {
    const items = project.issues.filter(item => item.parent === issue.id);
    setChildList(items);
  };

  const modalClose = () => { }


  const removeChild = async (item) => {
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: { parent: '' },
      itemId: item.id,
      workspaceId: item.projectId,
    }
    );

    // Optimistic update child list by removing the item
    const updatedList = childList.filter(child => child.id !== item.id);
    setChildList(updatedList);
  };


  const updateItem = (updatedFields, item) => {
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: updatedFields,
      itemId: item.id,
      workspaceId: item.projectId,
    }
    );
    //optimistic update child list with updated item
    const updatedList = childList.map(child => {
      if (child.id === item.id) {
        return { ...child, ...updatedFields }
      }
      return child
    })
    setChildList(updatedList)
  };





  return (
    <>
      <h3 className="fw-bold mb-1">Child issues</h3>
      {childList && childList.map((item, index) => (
        <div className="d-flex align-items-center mb-8" key={index}>

          <span className="bullet bullet-vertical h-40px" style={{ backgroundColor: issueTypeColors[item.type] }}></span>

          <div className="form-check form-check-custom form-check-solid mx-5">
            {/*             {item.status === 'done'?
            (<input className="form-check-input" type="checkbox"  defaultChecked onClick={() => handleChange(item)}/>)
            :
            (<input className="form-check-input" type="checkbox" defaultChecked={false} onClick={() => handleChange(item)}/>)
} */}
          </div>

          <div className="flex-grow-1 link-primary fw-bolder">
            <Link to={`/workspace/${issue.projectId}/board/issues/${item.id}`} target='_blank' className='link-primary fw-bolder'>
              {item.status == 'done' ?
                <span className="text-gray-800 text-hover-primary fw-bold fs-6" style={{ textDecoration: 'line-through' }}>{item.title}</span>
                :
                <span className="text-gray-800 text-hover-primary fw-bold fs-6">{item.title}</span>
              }
              <i className="bi bi-box-arrow-up-right mx-5"></i>
            </Link>

          </div>
          <div className="d-flex align-items-center">
            <div className="me-6">
              <span className="badge  fs-8 fw-bold"> <Status issue={item} updateIssue={(updatedFields) => updateItem(updatedFields, item)} /></span>
            </div>
            <span className="btn btn-icon btn-active-secondary btn-sm border-0">
              <ProjectBoardIssueDetailsDelete issue={item} modalClose={modalClose} />

            </span>
            <span className="btn btn-icon btn-sm  btn-active-secondary border-0" data-bs-toggle='tooltip' title='Remove child' onClick={() => removeChild(item)}>
              <i className='bi bi-x-lg'></i>

            </span>
          </div>

        </div>
      ))}
      <Create issueId={issue.id} issue={issue} />
    </>
  )
}



export default SubsComponent;
