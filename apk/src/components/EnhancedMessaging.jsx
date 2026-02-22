import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Image, Paperclip, Smile, MoreHorizontal, X, User, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import API from '../utils/api';
import MessageRequests from './MessageRequests';
import '../styles/MessagingPage.css';

const MessagingPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messageRequests, setMessageRequests] = useState([]);
  const [showMessageRequests, setShowMessageRequests] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken');

  // Initialize socket connection
  useEffect(() => {
    if (userId && token) {
      socketRef.current = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket']
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to messaging server');
        // Join user's room
        socketRef.current.emit('join_room', { roomId: `user_${userId}` });
      });

      // Handle incoming messages
      socketRef.current.on('receive_message', (messageData) => {
        setMessages(prev => [...prev, messageData]);
        scrollToBottom();
      });

      // Handle typing indicators
      socketRef.current.on('typing_indicator', (data) => {
        if (data.senderId !== userId) {
          setTypingUser(data.senderId);
          setShowTypingIndicator(true);
          
          // Hide typing indicator after 3 seconds of inactivity
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setShowTypingIndicator(false);
          }, 3000);
        }
      });

      // Handle user online status
      socketRef.current.on('user_status', (data) => {
        if (data.isOnline) {
          setOnlineUsers(prev => new Set(prev).add(data.userId));
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        clearTimeout(typingTimeoutRef.current);
      };
    }
  }, [userId, token]);

  // Fetch contacts and messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await API.get(`/user/${userId}/messages/contacts`);
        if (response.data.success) {
          setContacts(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const fetchMessageRequests = async () => {
      try {
        const response = await API.get(`/user/${userId}/message-requests`);
        if (response.data.success) {
          setMessageRequests(response.data.requests);
          setPendingRequestsCount(response.data.requests.filter(r => r.status === 'pending').length);
        }
      } catch (error) {
        console.error('Error fetching message requests:', error);
      }
    };

    if (userId) {
      fetchContacts();
      fetchMessageRequests();
    }
  }, [userId]);

  // Send typing indicator
  const sendTypingIndicator = (isTyping) => {
    if (selectedUser && socketRef.current) {
      socketRef.current.emit('typing', {
        senderId: userId,
        receiverId: selectedUser._id,
        isTyping: isTyping
      });
    }
  };

  // Handle message input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator
    if (value.trim() !== '' && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (value.trim() === '' && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(false);
      }

      const messageData = {
        content: newMessage.trim(),
        messageType: 'text'
      };

      const response = await API.post(
        `/user/${userId}/receiver/${selectedUser._id}/message/send`,
        messageData
      );

      if (response.data.success) {
        // Add to local messages
        setMessages(prev => [...prev, response.data.messageDetails]);
        setNewMessage('');
        scrollToBottom();
        
        // Emit through socket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            senderId: userId,
            receiverId: selectedUser._id,
            content: newMessage.trim(),
            _id: response.data.messageDetails._id
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Select user for chat
  const selectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    
    try {
      const response = await API.get(`/user/${userId}/${user._id}/message/get`);
      if (response.data.success) {
        setMessages(response.data.messagedetails);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render message bubbles
  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === userId;
    
    return (
      <div
        key={message._id}
        className={`message-bubble ${isOwnMessage ? 'sent' : 'received'}`}
      >
        {!isOwnMessage && (
          <div className="message-sender">
            {message.sender.username}
          </div>
        )}
        <div className="message-content">
          {message.content}
        </div>
        <div className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {isOwnMessage && message.read && (
            <span className="read-indicator">✓✓</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="messaging-container">
      {/* Sidebar with contacts */}
      <div className="contacts-sidebar">
        <div className="contacts-header">
          <h2>Messages</h2>
          <div className="online-count">
            {onlineUsers.size} online
          </div>
        </div>
        
        <div className="contacts-list">
          {contacts.map(contact => (
            <div
              key={contact._id}
              className={`contact-item ${selectedUser?._id === contact._id ? 'active' : ''}`}
              onClick={() => selectUser(contact)}
            >
              <div className="contact-avatar">
                <img 
                  src={contact.avatar || '/default-avatar.svg'} 
                  alt={contact.username}
                />
                {onlineUsers.has(contact._id) && (
                  <div className="online-indicator"></div>
                )}
              </div>
              <div className="contact-info">
                <div className="contact-name">
                  {contact.username}
                </div>
                <div className="contact-last-message">
                  {contact.lastMessage?.content?.substring(0, 30) || 'No messages yet'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="chat-container">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">
                  <img 
                    src={selectedUser.avatar || '/default-avatar.svg'} 
                    alt={selectedUser.username}
                  />
                  {onlineUsers.has(selectedUser._id) && (
                    <div className="online-status"></div>
                  )}
                </div>
                <div className="user-details">
                  <h3>{selectedUser.username}</h3>
                  {onlineUsers.has(selectedUser._id) ? (
                    <span className="status-online">Online</span>
                  ) : (
                    <span className="status-offline">Offline</span>
                  )}
                </div>
              </div>
              <div className="chat-actions">
                <button 
                  className="action-btn requests-btn"
                  onClick={() => setShowMessageRequests(true)}
                  title="Message Requests"
                >
                  <User size={20} />
                  {pendingRequestsCount > 0 && (
                    <span className="requests-badge">
                      {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                    </span>
                  )}
                </button>
                <button className="action-btn">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            {/* Messages display */}
            <div className="messages-area">
              <div className="messages-content">
                {messages.map(renderMessage)}
                
                {/* Typing indicator */}
                {showTypingIndicator && typingUser === selectedUser._id && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>{selectedUser.username} is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            <div className="message-input-area">
              <div className="input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="message-input"
                />
                <div className="input-actions">
                  <button className="icon-btn">
                    <Smile size={20} />
                  </button>
                  <button className="icon-btn">
                    <Paperclip size={20} />
                  </button>
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <MessageCircle size={64} />
            <h3>Select a conversation</h3>
            <p>Choose a contact to start messaging</p>
          </div>
        )}
      </div>
      
      {/* Message Requests Modal */}
      {showMessageRequests && (
        <MessageRequests 
          userId={userId}
          onClose={() => setShowMessageRequests(false)}
        />
      )}
    </div>
  );
};

export default MessagingPage;