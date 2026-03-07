import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {renderLink({ open: () => { } })}
      </AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {message && <AlertDialogDescription>{message}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onConfirm({ close: () => { } })}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleConfirm({ close: () => { } })}
            className={variant === 'danger' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ConfirmModal.propTypes = propTypes;
ConfirmModal.defaultProps = defaultProps;

export default ConfirmModal;
