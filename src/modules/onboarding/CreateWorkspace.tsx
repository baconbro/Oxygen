import { createPortal } from 'react-dom';
import { Modal } from 'react-bootstrap';
import { toAbsoluteUrl } from '../../utils';
import { CreateWorkspaceModal } from '../../components/partials';

import { useEffect, useState } from 'react';

const CreateWorkspace = () => {

  const [showCreateModal, setShowCreateModal] = useState<boolean>(true)

  return (

    <CreateWorkspaceModal show={showCreateModal} handleClose={() => setShowCreateModal(true)} />

  );
}

export default CreateWorkspace;