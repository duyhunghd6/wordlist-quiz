import React from 'react';

const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state-view">
      {Icon && (
        <div className="esv-icon">
          <Icon size={32} color="#94A3B8" />
        </div>
      )}
      <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>{title}</h3>
      <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-secondary)', textAlign: 'center' }}>{message}</p>
      {onAction && actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
