import React, { useState } from 'react';
import { AVATARS, getAvatarById } from '../constants/gameConfig';
import './ProfileSetup.css';

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
    <div className="profile-setup">
      <div className="profile-header">
        <span className="welcome-emoji">{currentAvatar.emoji}</span>
        <h1>Welcome to Wordlist Quiz!</h1>
        <p>Let's set up your profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">What's your name?</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Enter your name..."
            maxLength={20}
            autoComplete="off"
            autoFocus
          />
          {error && <span className="error-message">{error}</span>}
        </div>

        <div className="avatar-section">
          <label>Choose your avatar:</label>
          <div className="avatar-grid">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                className={`avatar-button ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avatar.id)}
                title={avatar.name}
              >
                <span className="avatar-emoji">{avatar.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Let's Go! 🚀
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
