import React, { useState } from 'react';
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { AVATARS, getAvatarById } from '../constants/gameConfig';
import './ProfileSwitcher.css';

const ProfileSwitcher = ({
  isOpen,
  onClose,
  profiles,
  activeId,
  onSwitch,
  onCreate,
  onUpdate,
  onDelete
}) => {
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('panda');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim(), selectedAvatar);
      setNewName('');
      setSelectedAvatar('panda');
      setMode('list');
      onClose();
    }
  };

  const handleUpdate = () => {
    if (newName.trim() && editingId) {
      onUpdate(editingId, { name: newName.trim(), avatar: selectedAvatar });
      setNewName('');
      setEditingId(null);
      setMode('list');
    }
  };

  const handleDelete = (id) => {
    if (profiles.length > 1) {
      onDelete(id);
    }
  };

  const startEdit = (profile) => {
    setEditingId(profile.id);
    setNewName(profile.name);
    setSelectedAvatar(profile.avatar);
    setMode('edit');
  };

  const startCreate = () => {
    setNewName('');
    setSelectedAvatar('panda');
    setMode('create');
  };

  const cancelAction = () => {
    setMode('list');
    setEditingId(null);
    setNewName('');
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'New Profile' : mode === 'edit' ? 'Edit Profile' : 'Switch Profile'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {mode === 'list' ? (
          <>
            <div className="profile-list">
              {profiles.map(profile => {
                const avatar = getAvatarById(profile.avatar);
                const isActive = profile.id === activeId;
                return (
                  <div 
                    key={profile.id} 
                    className={`profile-item ${isActive ? 'active' : ''}`}
                  >
                    <button 
                      className="profile-select"
                      onClick={() => { onSwitch(profile.id); onClose(); }}
                    >
                      <span className="profile-avatar-lg">{avatar?.emoji || '🐼'}</span>
                      <span className="profile-name">{profile.name}</span>
                      {isActive && <Check size={18} className="active-check" />}
                    </button>
                    <div className="profile-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => startEdit(profile)}
                        aria-label="Edit profile"
                      >
                        <Pencil size={16} />
                      </button>
                      {profiles.length > 1 && (
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(profile.id)}
                          aria-label="Delete profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="add-profile-btn" onClick={startCreate}>
              <Plus size={20} />
              <span>Add New Profile</span>
            </button>
          </>
        ) : (
          <div className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter name..."
                autoFocus
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label>Avatar</label>
              <div className="avatar-grid">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    className={`avatar-option ${selectedAvatar === av.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(av.id)}
                  >
                    <span className="avatar-emoji">{av.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={cancelAction}>
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={mode === 'create' ? handleCreate : handleUpdate}
                disabled={!newName.trim()}
              >
                <Check size={18} />
                <span>{mode === 'create' ? 'Create' : 'Save'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSwitcher;
