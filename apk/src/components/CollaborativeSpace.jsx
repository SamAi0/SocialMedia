import React, { useState, useEffect, useRef } from 'react';
import { Plus, Users, Edit3, Trash2, Share2, Lock, Unlock, Eye, EyeOff, MessageSquare, Heart } from 'lucide-react';

const CollaborativeSpace = ({ spaceId, userId, onClose }) => {
  const [space, setSpace] = useState(null);
  const [members, setMembers] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [spaceSettings, setSpaceSettings] = useState({
    name: '',
    description: '',
    isPrivate: true,
    allowComments: true,
    allowReactions: true
  });

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSpace({
        id: spaceId,
        name: 'Project Brainstorming',
        description: 'Team collaboration space for creative ideas',
        createdBy: userId,
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      setMembers([
        { id: userId, name: 'You', role: 'admin', avatar: '/default-avatar.svg' },
        { id: 'user2', name: 'Sarah Johnson', role: 'member', avatar: '/default-avatar.svg' },
        { id: 'user3', name: 'Mike Chen', role: 'member', avatar: '/default-avatar.svg' }
      ]);
      
      setContentItems([
        {
          id: '1',
          type: 'text',
          content: 'Initial project ideas and concepts',
          author: userId,
          authorName: 'You',
          createdAt: new Date(Date.now() - 3600000),
          comments: 3,
          reactions: { heart: 5, thumbsUp: 2 },
          isPinned: true
        },
        {
          id: '2',
          type: 'image',
          content: '/project-mockup.jpg',
          author: 'user2',
          authorName: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 7200000),
          comments: 1,
          reactions: { heart: 3 },
          isPinned: false
        },
        {
          id: '3',
          type: 'text',
          content: 'Market research findings and competitor analysis',
          author: 'user3',
          authorName: 'Mike Chen',
          createdAt: new Date(Date.now() - 10800000),
          comments: 5,
          reactions: { heart: 8, thumbsUp: 4, rocket: 2 },
          isPinned: false
        }
      ]);
      
      setSpaceSettings({
        name: 'Project Brainstorming',
        description: 'Team collaboration space for creative ideas',
        isPrivate: true,
        allowComments: true,
        allowReactions: true
      });
      
      setLoading(false);
    }, 1000);
  }, [spaceId, userId]);

  const handleAddContent = () => {
    if (!newContent.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      type: 'text',
      content: newContent,
      author: userId,
      authorName: 'You',
      createdAt: new Date(),
      comments: 0,
      reactions: {},
      isPinned: false
    };
    
    setContentItems(prev => [newItem, ...prev]);
    setNewContent('');
  };

  const handleEditContent = () => {
    if (!editContent.trim() || !selectedItem) return;
    
    setContentItems(prev => 
      prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, content: editContent, updatedAt: new Date() }
          : item
      )
    );
    
    setIsEditing(false);
    setSelectedItem(null);
    setEditContent('');
  };

  const handleDeleteContent = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setContentItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleTogglePin = (itemId) => {
    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, isPinned: !item.isPinned }
          : item
      )
    );
  };

  const handleAddReaction = (itemId, reactionType) => {
    setContentItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const reactions = { ...item.reactions };
          reactions[reactionType] = (reactions[reactionType] || 0) + 1;
          return { ...item, reactions };
        }
        return item;
      })
    );
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    
    // Mock adding member
    const newMember = {
      id: `user${members.length + 1}`,
      name: newMemberEmail.split('@')[0],
      role: 'member',
      avatar: '/default-avatar.svg'
    };
    
    setMembers(prev => [...prev, newMember]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (memberId) => {
    if (memberId === userId) return; // Can't remove yourself
    
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const handleUpdateSettings = () => {
    setSpace(prev => ({
      ...prev,
      name: spaceSettings.name,
      description: spaceSettings.description,
      isPrivate: spaceSettings.isPrivate,
      updatedAt: new Date()
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditItem = (item) => {
    return item.author === userId || members.find(m => m.id === userId)?.role === 'admin';
  };

  if (loading) {
    return (
      <div className="collaborative-space-loading">
        <div className="spinner"></div>
        <p>Loading collaborative space...</p>
      </div>
    );
  }

  return (
    <div className="collaborative-space-modal">
      <div className="collaborative-space-container">
        {/* Header */}
        <div className="space-header">
          <div className="space-info">
            <h2>{space.name}</h2>
            <p>{space.description}</p>
            <div className="space-meta">
              <span className="privacy-indicator">
                {space.isPrivate ? <Lock size={16} /> : <Unlock size={16} />}
                {space.isPrivate ? 'Private' : 'Public'}
              </span>
              <span className="member-count">
                <Users size={16} />
                {members.length} members
              </span>
              <span className="created-date">
                Created {formatDate(space.createdAt)}
              </span>
            </div>
          </div>
          <div className="space-actions">
            <button 
              className={`members-toggle ${showMembers ? 'active' : ''}`}
              onClick={() => setShowMembers(!showMembers)}
            >
              <Users size={20} />
              Members
            </button>
            <button className="settings-btn" onClick={() => setIsEditing(true)}>
              <Edit3 size={20} />
              Settings
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="space-content">
          {/* Members Panel */}
          {showMembers && (
            <div className="members-panel">
              <div className="members-header">
                <h3>Space Members</h3>
                <div className="add-member">
                  <input
                    type="email"
                    placeholder="Add member by email..."
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <button onClick={handleAddMember}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="members-list">
                {members.map(member => (
                  <div key={member.id} className="member-item">
                    <img src={member.avatar} alt={member.name} />
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.role}</span>
                    </div>
                    {member.id !== userId && (
                      <button 
                        className="remove-member"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="content-area">
            {/* Add New Content */}
            <div className="add-content">
              <textarea
                placeholder="Share your thoughts, ideas, or updates..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
              />
              <div className="content-actions">
                <div className="content-types">
                  <button className="content-type-btn">📷 Photo</button>
                  <button className="content-type-btn">📎 File</button>
                  <button className="content-type-btn">🔗 Link</button>
                </div>
                <button 
                  className="post-btn"
                  onClick={handleAddContent}
                  disabled={!newContent.trim()}
                >
                  Post
                </button>
              </div>
            </div>

            {/* Content Items */}
            <div className="content-items">
              {contentItems
                .sort((a, b) => {
                  // Pinned items first, then by date
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map(item => (
                  <div key={item.id} className="content-item">
                    {item.isPinned && (
                      <div className="pinned-indicator">
                        <span>📌 Pinned</span>
                      </div>
                    )}
                    
                    <div className="item-header">
                      <div className="author-info">
                        <img src="/default-avatar.svg" alt={item.authorName} />
                        <div>
                          <span className="author-name">{item.authorName}</span>
                          <span className="post-time">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="item-actions">
                        {canEditItem(item) && (
                          <>
                            <button 
                              className="edit-btn"
                              onClick={() => {
                                setSelectedItem(item);
                                setEditContent(item.content);
                                setIsEditing(true);
                              }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          className="pin-btn"
                          onClick={() => handleTogglePin(item.id)}
                        >
                          📌
                        </button>
                      </div>
                    </div>

                    <div className="item-content">
                      {item.type === 'text' ? (
                        <p>{item.content}</p>
                      ) : (
                        <img src={item.content} alt="Content" />
                      )}
                    </div>

                    <div className="item-interactions">
                      <div className="reactions">
                        {Object.entries(item.reactions).map(([reaction, count]) => (
                          <button
                            key={reaction}
                            className="reaction-btn"
                            onClick={() => handleAddReaction(item.id, reaction)}
                          >
                            {reaction} {count}
                          </button>
                        ))}
                        <button 
                          className="add-reaction"
                          onClick={() => handleAddReaction(item.id, '👍')}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="comments-count">
                        <MessageSquare size={16} />
                        {item.comments} comments
                      </div>
                      
                      <button className="share-btn">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>{selectedItem ? 'Edit Content' : 'Space Settings'}</h3>
            
            {selectedItem ? (
              <div className="edit-content-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedItem(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={handleEditContent}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-settings-form">
                <div className="form-group">
                  <label>Space Name</label>
                  <input
                    type="text"
                    value={spaceSettings.name}
                    onChange={(e) => setSpaceSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={spaceSettings.description}
                    onChange={(e) => setSpaceSettings(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={spaceSettings.isPrivate}
                      onChange={(e) => setSpaceSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    />
                    Private Space
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={spaceSettings.allowComments}
                      onChange={(e) => setSpaceSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                    />
                    Allow Comments
                  </label>
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={spaceSettings.allowReactions}
                      onChange={(e) => setSpaceSettings(prev => ({ ...prev, allowReactions: e.target.checked }))}
                    />
                    Allow Reactions
                  </label>
                </div>
                
                <div className="edit-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-btn"
                    onClick={handleUpdateSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeSpace;