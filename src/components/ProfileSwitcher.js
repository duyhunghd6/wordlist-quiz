import React, { useState } from 'react';
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { AVATARS, getAvatarById } from '../constants/gameConfig';

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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 41, 59, 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }} onClick={onClose}>
      <div className="card shadow-drag" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', borderColor: 'transparent', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', margin: 0 }}>
            {mode === 'create' ? 'New Profile' : mode === 'edit' ? 'Edit Profile' : 'Switch Profile'}
          </h2>
          <button 
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {mode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {profiles.map(profile => {
                const avatar = getAvatarById(profile.avatar);
                const isActive = profile.id === activeId;
                
                return (
                  <div key={profile.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', background: isActive ? '#F0FDF4' : 'white', border: `2px solid ${isActive ? 'var(--color-success)' : 'var(--color-border-default)'}` }}>
                    
                    <button 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-md)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                      onClick={() => { onSwitch(profile.id); onClose(); }}
                    >
                      <span className="avatar avatar-md" style={{ background: 'white' }}>{avatar?.emoji || '🐼'}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{profile.name}</span>
                      {isActive && <Check size={20} color="var(--color-success)" style={{ marginLeft: 'auto' }} />}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)', cursor: 'pointer' }}
                        onClick={() => startEdit(profile)}
                        aria-label="Edit profile"
                      >
                        <Pencil size={16} />
                      </button>
                      {profiles.length > 1 && (
                        <button 
                          style={{ background: '#FEF2F2', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)', cursor: 'pointer' }}
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
            
            <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={startCreate}>
              <Plus size={20} />
              <span>Add New Profile</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Name</label>
              <input
                className="input-text"
                style={{ width: '100%' }}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Enter name..."
                autoFocus
                maxLength={20}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Avatar</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {AVATARS.map(av => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar avatar-md ${isSelected ? 'shadow-md' : 'shadow-sm'}`}
                      style={{ 
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-default)',
                        background: isSelected ? 'var(--color-background-default)' : 'white'
                      }}
                      onClick={() => setSelectedAvatar(av.id)}
                    >
                      <span style={{ fontSize: '20px' }}>{av.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelAction}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
