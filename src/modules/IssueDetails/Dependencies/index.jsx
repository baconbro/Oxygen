import { useState } from 'react';
import { Search } from '../../../components/partials';
import DepDescription from './depDescription';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { Select, IssueTypeIcon } from '../../../components/common';
import { useAuth } from '../../auth';
import { useUpdateItem } from '../../../services/itemServices';
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from react-bootstrap


const TaskDependencies = ({ issue, updateIssue, modalClose, scope }) => {
  const [dependencies, setDependencies] = useState(issue.dependencies || []);
  const { project } = useWorkspace();
  const { currentUser } = useAuth();
  const editItemMutation = useUpdateItem();
  const [showModal, setShowModal] = useState(false);
  const [dependencyToDelete, setDependencyToDelete] = useState(null);


  const updateDependencies = (fields, id) => {
    const newDependencies = dependencies.map((dep) => {
      if (dep.id === id.id) {
        return { ...dep, ...fields };
      }
      return dep;
    });
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: { dependencies: newDependencies },
      itemId: issue.id,
      workspaceId: issue.projectId,
    }
    );
    setDependencies(newDependencies);

  }
  const handleDeleteClick = (id) => {
    setDependencyToDelete(id);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (dependencyToDelete) {
      deleteDependencie(dependencyToDelete);
      setShowModal(false);
      setDependencyToDelete(null);
    }
  };
  const handleCancelDelete = () => {
    setShowModal(false);
    setDependencyToDelete(null);
  };

  const deleteDependencie = (id) => {
    setDependencyToDelete(id);
    setShowModal(true);
    const newDependencies = dependencies.filter((dep) => dep.id !== id.id);
    const mutateItem = editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: { dependencies: newDependencies },
      itemId: issue.id,
      workspaceId: issue.projectId,
    }
    );
    setDependencies(newDependencies);
  }

  const handleAddDependency = (newDependency) => {
    const updatedDependencies = [...dependencies, newDependency];
    setDependencies(updatedDependencies);
    editItemMutation({
      orgId: currentUser?.all?.currentOrg,
      field: { dependencies: updatedDependencies },
      itemId: issue.id,
      workspaceId: issue.projectId,
    });
  };


  //returne the issue from project.issues that has the same id as the dependency
  const getIssue = (id) => {
    return project.issues.find((issue) => issue.id === Number(id));
  };

  const DepType = {
    BLOCKED_BY: 'BLOCKED_BY',
    BLOCKS: 'BLOCKS',
    DUPLICATES: 'DUPLICATES',
    DUPLICATED_BY: 'DUPLICATED_BY',
    RELATES_TO: 'RELATES_TO',
  };

  return (
    <>
      <div className='mb-6'>
        <Search orgId={currentUser?.all?.currentOrg} scope={'project'} currentId={issue.id} onAddDependency={handleAddDependency} />
      </div>
      {/* if dependencies */}
      {dependencies.length > 0 && Object.values(dependencies).map((values, index) => {
        return (
          <div className="m-0 row border-gray-300 border-dashed rounded pb-1 mb-6" key={index}>
            <div className="timeline ms-n1 col-5">
              <div className="timeline-item align-items-center mb-4">
                <div className="timeline-line w-20px mt-12 mb-n14"></div>
                <div className="timeline-icon pt-1" style={{ marginLeft: "0.7" }}>
                  <i className="ki-duotone ki-cd fs-2 text-success"><span className="path1"></span><span className="path2"></span></i>
                </div>
                <div className="timeline-content m-0">
                  <a href="#" className="fs-6 text-gray-800 fw-bold d-block text-hover-primary"> <IssueTypeIcon type={getIssue(values.A).type} top={1} className='svg-icon-2 svg-icon-primary' /> {getIssue(values.A).title}</a>
                  <span className="fw-semibold text-gray-400">{getIssue(values.A).id}</span>
                </div>

              </div>

              <div className="timeline-item align-items-center">
                <div className="timeline-line w-20px"></div>
                <div className="timeline-icon pt-1" style={{ marginLeft: "0.5" }}>
                  <i className="bi bi-link-45deg fs-2 text-info"></i>
                </div>
                <div className=" m-0 ">
                  <Select
                    variant="empty"
                    dropdownWidth={150}
                    withClearValue={false}
                    name="type"
                    value={values.type}
                    options={Object.values(DepType).map(type => ({
                      value: type,
                      label: DepType[type],
                    }))}
                    onChange={type => updateDependencies({ type }, { id: values.id })}
                    renderValue={({ value: type }) => (
                      <span className="fs-8 fw-bolder text-info text-uppercase" >{type}</span>
                    )}
                    renderOption={({ value: type }) => (
                      <span className="fs-8 fw-bolder text-info text-uppercase" >{type}</span>
                    )}
                  />
                  <a href="#" className="fs-6 text-gray-800 fw-bold d-block text-hover-primary"> <IssueTypeIcon type={getIssue(values.B).type} top={1} className='svg-icon-2 svg-icon-primary' />{getIssue(values.B).title}</a>
                  <span className="fw-semibold text-gray-400">{getIssue(values.B).id}</span>
                </div>
              </div>
            </div>
            <div className="ms-n1 col-6">
              <DepDescription issue={values} updateIssue={updateDependencies} />
            </div>
            <div className="ms-n1 col-1 d-flex flex-column-fluid flex-center">
              <i className="bi bi-trash fs-2 text-danger" onClick={() => handleDeleteClick({ id: values.id })}></i>
            </div>
          </div>)
      }
      )}
      {/* Modal for confirming deletion */}
      <Modal show={showModal} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this dependency?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};


export default TaskDependencies;
