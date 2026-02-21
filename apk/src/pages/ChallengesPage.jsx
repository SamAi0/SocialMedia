import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Plus, Search, Filter, Clock, CheckCircle, UserPlus } from 'lucide-react';
import '../styles/ChallengesPage.css';
import API from '../utils/api';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChallenges();
  }, [filter]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      // This would be implemented with actual API calls
      const mockChallenges = [
        {
          _id: '1',
          title: '30-Day Fitness Challenge',
          description: 'Transform your body in 30 days with daily workouts',
          category: 'fitness',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-01'),
          createdBy: { name: 'Fitness Guru', avatar: '/default-avatar.svg' },
          participants: 1247,
          currentStreak: 15,
          isJoined: true,
          progress: 65
        },
        {
          _id: '2',
          title: 'Cooking Masterclass',
          description: 'Learn 50 recipes in 30 days',
          category: 'cooking',
          startDate: new Date('2024-02-15'),
          endDate: new Date('2024-03-15'),
          createdBy: { name: 'Chef Maria', avatar: '/default-avatar.svg' },
          participants: 892,
          currentStreak: 8,
          isJoined: false,
          progress: 27
        },
        {
          _id: '3',
          title: 'Reading Challenge',
          description: 'Read 12 books in 3 months',
          category: 'reading',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-04-01'),
          createdBy: { name: 'Book Club', avatar: '/default-avatar.svg' },
          participants: 2156,
          currentStreak: 42,
          isJoined: true,
          progress: 95
        }
      ];
      setChallenges(mockChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesFilter = filter === 'all' || challenge.category === filter;
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      fitness: '#ff6b6b',
      cooking: '#4ecdc4',
      reading: '#45b7d1',
      learning: '#96ceb4',
      creativity: '#feca57',
      social: '#ff9ff3'
    };
    return colors[category] || '#6c757d';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#28a745';
    if (progress >= 50) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div className="challenges-page">
      <div className="challenges-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <Trophy size={32} />
              Group Challenges
            </h1>
            <p>Join communities and achieve your goals together</p>
          </div>
          <button 
            className="create-challenge-btn"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={20} />
            Create Challenge
          </button>
        </div>
        
        <div className="challenges-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'fitness' ? 'active' : ''}`}
              onClick={() => setFilter('fitness')}
            >
              Fitness
            </button>
            <button 
              className={`filter-btn ${filter === 'cooking' ? 'active' : ''}`}
              onClick={() => setFilter('cooking')}
            >
              Cooking
            </button>
            <button 
              className={`filter-btn ${filter === 'reading' ? 'active' : ''}`}
              onClick={() => setFilter('reading')}
            >
              Reading
            </button>
          </div>
        </div>
      </div>

      <div className="challenges-content">
        {loading ? (
          <div className="loading-challenges">
            <div className="spinner"></div>
            <p>Loading challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="no-challenges">
            <Trophy size={64} />
            <h3>No challenges found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="challenges-grid">
            {filteredChallenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-header">
                  <div className="challenge-category" style={{ 
                    backgroundColor: getCategoryColor(challenge.category) 
                  }}>
                    {challenge.category}
                  </div>
                  {challenge.isJoined && (
                    <div className="joined-badge">
                      <CheckCircle size={16} />
                      Joined
                    </div>
                  )}
                </div>
                
                <div className="challenge-content">
                  <h3>{challenge.title}</h3>
                  <p className="challenge-description">{challenge.description}</p>
                  
                  <div className="challenge-meta">
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{challenge.currentStreak} day streak</span>
                    </div>
                  </div>
                  
                  <div className="challenge-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${challenge.progress}%`,
                          backgroundColor: getProgressColor(challenge.progress)
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">{challenge.progress}% complete</span>
                  </div>
                </div>
                
                <div className="challenge-actions">
                  {challenge.isJoined ? (
                    <button className="continue-btn">
                      Continue Challenge
                    </button>
                  ) : (
                    <button className="join-btn">
                      <UserPlus size={16} />
                      Join Challenge
                    </button>
                  )}
                  <button className="view-btn">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Form Modal */}
      {showCreateForm && (
        <div className="create-challenge-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Challenge</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Challenge creation form would go here...</p>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesPage;