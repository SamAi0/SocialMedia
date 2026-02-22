import React, { useState, useEffect } from 'react';
import { User, Check, X, Clock, AlertCircle } from 'lucide-react';
import API from '../utils/api';
import '../styles/MessageRequests.css';

const MessageRequests = ({ userId, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch received requests
      const receivedResponse = await API.get(`/user/${userId}/message-requests`);
      if (receivedResponse.data.success) {
        setRequests(receivedResponse.data.requests);
      }

      // Fetch sent requests
      const sentResponse = await API.get(`/user/${userId}/sent-message-requests`);
      if (sentResponse.data.success) {
        setSentRequests(sentResponse.data.requests);
      }
    } catch (error) {
      console.error('Error fetching message requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await API.post(`/message-request/${requestId}/accept`, {
        userId: userId
      });
      
      if (response.data.success) {
        // Remove accepted request from list
        setRequests(prev => prev.filter(req => req._id !== requestId));
        // Show success message
        alert('Message request accepted!');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept message request');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const response = await API.post(`/message-request/${requestId}/decline`, {
        userId: userId
      });
      
      if (response.data.success) {
        // Remove declined request from list
        setRequests(prev => prev.filter(req => req._id !== requestId));
        // Show success message
        alert('Message request declined');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline message request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-pending" />;
      case 'accepted':
        return <Check size={16} className="status-accepted" />;
      case 'declined':
        return <X size={16} className="status-declined" />;
      case 'expired':
        return <AlertCircle size={16} className="status-expired" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="message-requests-modal">
        <div className="modal-content">
          <div className="loading">Loading message requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-requests-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Message Requests</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Received ({requests.length})
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        <div className="requests-content">
          {activeTab === 'received' ? (
            <div className="received-requests">
              {requests.length === 0 ? (
                <div className="no-requests">
                  <User size={48} />
                  <h3>No Message Requests</h3>
                  <p>You don't have any pending message requests</p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request._id} className="request-item">
                    <div className="request-header">
                      <div className="sender-info">
                        <img 
                          src={request.sender.avatar || '/default-avatar.svg'} 
                          alt={request.sender.username}
                          className="sender-avatar"
                        />
                        <div className="sender-details">
                          <h4>{request.sender.username}</h4>
                          <p className="request-time">{formatTime(request.sentAt)}</p>
                        </div>
                      </div>
                      <div className="request-status">
                        {getStatusIcon(request.status)}
                        <span className={`status-text status-${request.status}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-content">
                      <p>{request.content}</p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button
                          className="accept-btn"
                          onClick={() => handleAcceptRequest(request._id)}
                        >
                          <Check size={16} />
                          Accept
                        </button>
                        <button
                          className="decline-btn"
                          onClick={() => handleDeclineRequest(request._id)}
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="sent-requests">
              {sentRequests.length === 0 ? (
                <div className="no-requests">
                  <User size={48} />
                  <h3>No Sent Requests</h3>
                  <p>You haven't sent any message requests</p>
                </div>
              ) : (
                sentRequests.map(request => (
                  <div key={request._id} className="request-item sent">
                    <div className="request-header">
                      <div className="receiver-info">
                        <img 
                          src={request.receiver.avatar || '/default-avatar.svg'} 
                          alt={request.receiver.username}
                          className="receiver-avatar"
                        />
                        <div className="receiver-details">
                          <h4>{request.receiver.username}</h4>
                          <p className="request-time">{formatTime(request.sentAt)}</p>
                        </div>
                      </div>
                      <div className="request-status">
                        {getStatusIcon(request.status)}
                        <span className={`status-text status-${request.status}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-content">
                      <p>{request.content}</p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="request-info">
                        <p>Waiting for {request.receiver.username} to respond</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageRequests;