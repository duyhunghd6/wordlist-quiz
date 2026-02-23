import React, { useState } from 'react';
import { AVATARS, getAvatarById } from '../constants/gameConfig';

const ProfileSetup = ({ onComplete, initialProfile }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialProfile?.avatar || 'panda'
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name! 😊');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters! 📝');
      return;
    }
    if (trimmedName.length > 20) {
      setError('Name is too long! Max 20 characters 😅');
      return;
    }

    onComplete({
      name: trimmedName,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString()
    });
  };

  const currentAvatar = getAvatarById(selectedAvatar);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 'var(--space-md)' }}>
      <div className="card shadow-md" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--space-sm)' }}>
            {currentAvatar.emoji}
          </div>
          <h1 style={{ color: 'var(--color-text-primary)' }}>Welcome to Wordlist Quiz!</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <label htmlFor="name" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>What's your name?</label>
            <input
              id="name"
              type="text"
              className="input-text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name..."
              maxLength={20}
              autoComplete="off"
              autoFocus
              style={{ width: '100%' }}
            />
            {error && <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <label style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Choose your avatar:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar avatar-md ${isSelected ? 'shadow-md' : 'shadow-sm'}`}
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      aspectRatio: '1', 
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-default)',
                      background: isSelected ? 'var(--color-background-default)' : 'white'
                    }}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    title={avatar.name}
                  >
                    <span style={{ fontSize: '24px' }}>{avatar.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: 'var(--space-md)' }}>
            Let's Go! 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
