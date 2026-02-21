import React, { useState, useEffect } from 'react';
import { ThumbsUp, Heart, Laugh, AlertTriangle, Frown, Angry } from 'lucide-react';
import '../styles/ReactionPicker.css';
import API from '../utils/api';

const ReactionPicker = ({ postId, userId, onReaction, currentReaction, reactionCounts }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localReactionCounts, setLocalReactionCounts] = useState(reactionCounts || {});
  const [userReaction, setUserReaction] = useState(currentReaction || null);

  const reactionTypes = [
    { type: 'like', icon: ThumbsUp, color: '#1877f2', label: 'Like' },
    { type: 'love', icon: Heart, color: '#f33e58', label: 'Love' },
    { type: 'haha', icon: Laugh, color: '#f7b928', label: 'Haha' },
    { type: 'wow', icon: AlertTriangle, color: '#f7b928', label: 'Wow' },
    { type: 'sad', icon: Frown, color: '#f7b928', label: 'Sad' },
    { type: 'angry', icon: Angry, color: '#e9710f', label: 'Angry' }
  ];

  useEffect(() => {
    // Update local state when props change
    setLocalReactionCounts(reactionCounts || {});
    setUserReaction(currentReaction || null);
  }, [reactionCounts, currentReaction]);

  const handleReactionClick = async (reactionType) => {
    try {
      const response = await API.post(`/api/posts/${postId}/reactions`, {
        reactionType
      });

      if (response.data.success) {
        const { action, reaction } = response.data;
        
        // Update local state based on action
        if (action === 'added') {
          // Add new reaction
          setUserReaction(reactionType);
          setLocalReactionCounts(prev => ({
            ...prev,
            [reactionType]: (prev[reactionType] || 0) + 1
          }));
        } else if (action === 'removed') {
          // Remove reaction
          setUserReaction(null);
          setLocalReactionCounts(prev => ({
            ...prev,
            [reactionType]: Math.max(0, (prev[reactionType] || 0) - 1)
          }));
        } else if (action === 'updated') {
          // Update reaction (change from one type to another)
          if (userReaction) {
            setLocalReactionCounts(prev => ({
              ...prev,
              [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1),
              [reactionType]: (prev[reactionType] || 0) + 1
            }));
          }
          setUserReaction(reactionType);
        }

        // Notify parent component
        if (onReaction) {
          onReaction(reactionType, action);
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    
    setShowPicker(false);
  };

  const getReactionButtonClass = () => {
    if (userReaction) {
      return `reaction-button reacted ${userReaction}`;
    }
    return 'reaction-button';
  };

  const getReactionIcon = () => {
    if (userReaction) {
      const reaction = reactionTypes.find(r => r.type === userReaction);
      return reaction ? reaction.icon : ThumbsUp;
    }
    return ThumbsUp;
  };

  const getReactionColor = () => {
    if (userReaction) {
      const reaction = reactionTypes.find(r => r.type === userReaction);
      return reaction ? reaction.color : '#1877f2';
    }
    return '#65676b';
  };

  const getTotalReactions = () => {
    return Object.values(localReactionCounts).reduce((sum, count) => sum + (count || 0), 0);
  };

  const renderReactionCount = () => {
    const total = getTotalReactions();
    if (total === 0) return null;
    
    return (
      <div className="reaction-count">
        <span className="count-number">{total}</span>
        <div className="reaction-icons">
          {reactionTypes
            .filter(type => localReactionCounts[type.type] > 0)
            .slice(0, 3)
            .map(type => {
              const IconComponent = type.icon;
              return (
                <IconComponent
                  key={type.type}
                  size={14}
                  color={type.color}
                  className="reaction-icon"
                />
              );
            })}
        </div>
      </div>
    );
  };

  const ReactionIcon = getReactionIcon();

  return (
    <div className="reaction-picker-container">
      <div className="reaction-main-button">
        <button
          className={getReactionButtonClass()}
          onClick={() => setShowPicker(!showPicker)}
          style={{ color: getReactionColor() }}
        >
          <ReactionIcon size={20} />
          <span className="reaction-label">
            {userReaction ? 
              reactionTypes.find(r => r.type === userReaction)?.label || 'Like' : 
              'Like'
            }
          </span>
        </button>
        {renderReactionCount()}
      </div>

      {showPicker && (
        <div className="reaction-picker-popup">
          <div className="reaction-options">
            {reactionTypes.map((reaction) => {
              const IconComponent = reaction.icon;
              return (
                <button
                  key={reaction.type}
                  className={`reaction-option ${userReaction === reaction.type ? 'active' : ''}`}
                  onClick={() => handleReactionClick(reaction.type)}
                  style={{ 
                    '--reaction-color': reaction.color,
                    '--reaction-hover-color': reaction.color + '40'
                  }}
                >
                  <IconComponent size={24} />
                  <span className="reaction-tooltip">{reaction.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="reaction-picker-arrow"></div>
        </div>
      )}

      {showPicker && (
        <div 
          className="reaction-picker-overlay"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default ReactionPicker;