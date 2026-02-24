import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorToast = ({ message, subtitle, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="snackbar-toast error" style={{ zIndex: 9999 }}>
      <AlertCircle size={24} color="var(--color-danger)" />
      <div className="toast-content">
        <strong>{message}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close error">
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default ErrorToast;
