import { useState } from 'react';
import PropTypes from 'prop-types';

import { StyledConfirmModal, Title, Message, Actions, StyledButton } from './Styles';

const propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger']),
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  renderLink: PropTypes.func.isRequired,
};

const defaultProps = {
  className: undefined,
  variant: 'primary',
  title: 'Warning',
  message: 'Are you sure you want to continue with this action?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

const ConfirmModal = ({
  className,
  variant,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  renderLink,
}) => {
  const [isWorking, setWorking] = useState(false);

  const handleConfirm = modal => {
    //setWorking(true);
    modal.close();
    onConfirm({
      close: () => {
        modal.close();
        //setWorking(false);
      },
    });
  };

  return (
    <StyledConfirmModal
      className={className}
      testid="modal:confirm"
      withCloseIcon={false}
      renderLink={renderLink}
      renderContent={modal => (
        <>
          <Title>{title}</Title>
          {message && <Message>{message}</Message>}
          <Actions>
            <button
              variant={variant}
              //isWorking={isWorking}
              onClick={() => handleConfirm(modal)}
              className="btn btn-danger"
            >
              {confirmText}
            </button>
            <button onClick={modal.close} className="btn">
              {cancelText}
            </button>
          </Actions>
        </>
      )}
    />
  );
};

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;

export default ConfirmModal;
