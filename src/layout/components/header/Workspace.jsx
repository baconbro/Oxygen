import React, { useState } from "react";
import { Avatar } from "../../../components/common";
import { Link } from 'react-router-dom'
import { CreateWorkspaceModal } from "../../../components/partials"

const WorkspaceHeaderMenu = ({spaces}) => {
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
        <>
            {spaces && spaces.map((space, index) => (
                <div className="col-lg-6 mb-3" key={index}>
                    <div className="menu-item p-0 m-0">
                        <Link to={`/workspace/${space.id}`} className="menu-link" >
                            <span className="menu-custom-icon d-flex flex-center flex-shrink-0 rounded w-40px h-40px me-3">
                                <Avatar avatarUrl="" name={space.title} size={50} className='me-5' />
                            </span>
                            <span className="d-flex flex-column">
                                <span className="fs-6 fw-bold text-gray-800">{space.title}</span>
                                <span className="fs-7 fw-semibold text-muted">{space.id}</span>
                            </span>
                        </Link>
                    </div>
                </div>
            ))}
            <div className="col-lg-6 mb-3">
                <CreateWorkspaceModal show={showCreateModal} handleClose={() => setShowCreateModal(false)} />
                <button className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary" onClick={() => setShowCreateModal(true)}>
                    <span className="btn-label">Create a workspace </span>
                    <span className="svg-icon btn-icon svg-icon-2">
                        <i className="bi bi-plus"></i>
                    </span>
                </button>
            </div>
        </>
    )
}
export default WorkspaceHeaderMenu;