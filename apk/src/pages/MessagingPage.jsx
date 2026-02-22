import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import { 
  Send, User, Phone, Video, MoreVertical, Smile, 
  Camera, Reply, MessageSquare, Settings, Users, Eye, EyeOff, Activity
} from 'lucide-react';
import '../styles/MessagingPage.css';
import '../styles/UserActivityTracker.css';
import API from '../utils/api';
import UserActivityTracker from '../components/UserActivityTracker';

const MessagingPage = () => {
  const location = useLocation();
  const initialContact = location.state?.selectedContact || null;
  
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(initialContact);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [isVanishingMode, setIsVanishingMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showReactions, setShowReactions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showActivityTracker, setShowActivityTracker] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Emoji reactions
  const emojis = ['❤️', '👍', '😂', '😮', '😢', '😡', '👏', '🔥'];

  // Connect to socket.io server
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
      return;
    }

    // Connect to socket.io server
    const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    setSocket(newSocket);

    // Clean up on component unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [navigate]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Join personal room
    socket.emit('join_room', userId);

    // Event listeners
    socket.on('new-message', (data) => {
      console.log('Received new message:', data);
      
      // Add to messages if it's from the current chat
      if (selectedContact && (
        // Check if it's a direct message between current user and selected contact
        ((data.senderId === selectedContact._id && data.receiverId === userId) ||
         (data.senderId === userId && data.receiverId === selectedContact._id)) ||
        // Or if it's a group message
        (data.groupId && groupMode && data.groupId === selectedContact._id)
      )) {
        // Ensure the incoming message has proper sender information
        const messageWithSenderInfo = data.message;
        setMessages(prev => [...prev, messageWithSenderInfo]);
      }
    });

    socket.on('message-reaction', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: [...(msg.reactions || []), data.reaction] }
          : msg
      ));
    });

    socket.on('message-read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, read: true, readAt: data.readAt }
          : msg
      ));
    });

    socket.on('mention-notification', (data) => {
      // Show notification for mentions
      console.log('Mentioned in message:', data);
    });

    socket.on('typing-indicator', (data) => {
      if (selectedContact && (
        data.senderId === selectedContact._id
      )) {
        setIsTyping(data.isTyping);
      }
    });

    // Clean up event listeners
    return () => {
      socket.off('new-message');
      socket.off('message-reaction');
      socket.off('message-read');
      socket.off('mention-notification');
      socket.off('typing-indicator');
    };
  }, [socket, selectedContact, groupMode]);

  // Fetch user data and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');

        if (!userId || !token) {
          navigate('/');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile
        const userResponse = await API.get(
          `/user/profile/${userId}`,
          { headers }
        );

        setUser(userResponse.data.exist);

        // Fetch contacts with message history
        const messageContactsResponse = await API.get(
          `/user/${userId}/messages/contacts`,
          { headers }
        );

        if (messageContactsResponse.data && messageContactsResponse.data.success) {
          console.log("Message contacts:", messageContactsResponse.data.users);
          const messageContacts = messageContactsResponse.data.users || [];
          
          // Fetch user's followers and following to add potential contacts who haven't messaged yet
          const followersResponse = await API.get(
            `/user/${userId}/followers`,
            { headers }
          );

          const followingResponse = await API.get(
            `/user/${userId}/following`,
            { headers }
          );

          // Combine followers and following to create contacts list
          const followers = followersResponse.data.followersList || [];
          const following = followingResponse.data.followingsList || [];

          // Create a map of contacts with message history for quick lookup
          const messageContactsMap = new Map(
            messageContacts.map(contact => [contact._id, contact])
          );

          // Add followers and following who aren't in message contacts
          followers.forEach(follower => {
            if (follower.follower && !messageContactsMap.has(follower.follower._id)) {
              messageContacts.push({
                ...follower.follower,
                hasMessaged: false
              });
            }
          });
          
          following.forEach(follow => {
            if (follow.following && !messageContactsMap.has(follow.following._id)) {
              messageContacts.push({
                ...follow.following,
                hasMessaged: false
              });
            }
          });

          // Ensure contacts have hasMessaged property
          const enhancedContacts = messageContacts.map(contact => ({
            ...contact,
            hasMessaged: !!contact.lastMessage
          }));

          setContacts(enhancedContacts);
        } else {
          // Fallback to only followers/following if message contacts fails
          const followersResponse = await API.get(
            `/user/${userId}/followers`,
            { headers }
          );

          const followingResponse = await API.get(
            `/user/${userId}/following`,
            { headers }
          );

          // Combine followers and following to create contacts list
          const followers = followersResponse.data.followersList || [];
          const following = followingResponse.data.followingsList || [];

          // Create a unique list of contacts
          const uniqueContacts = {};
          
          followers.forEach(follower => {
            if (follower.follower) {
              uniqueContacts[follower.follower._id] = {
                ...follower.follower,
                hasMessaged: false
              };
            }
          });
          
          following.forEach(follow => {
            if (follow.following) {
              uniqueContacts[follow.following._id] = {
                ...follow.following,
                hasMessaged: false
              };
            }
          });
          
          const contactsList = Object.values(uniqueContacts);
          setContacts(contactsList);
        }

        // If we have an initial contact from navigation state, make sure it's selected
        if (initialContact) {
          setSelectedContact(initialContact);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, initialContact]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when selecting a contact
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact) return;

      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('accessToken');

        if (!userId || !token) {
          navigate('/');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        console.log(`Fetching messages between ${userId} and ${selectedContact._id}`);

        // Fetch messages between current user and selected contact
        const response = await API.get(
          `/user/${userId}/${selectedContact._id}/message/get`,
          { headers }
        );

        console.log('API response:', response.data);

        if (response.data && response.data.messagedetails) {
          const fetchedMessages = response.data.messagedetails;
          console.log(`Loaded ${fetchedMessages.length} messages:`, fetchedMessages);
          
          // Format messages to ensure proper display - preserve all message properties
          setMessages(fetchedMessages);
        } else {
          console.warn('No messages found or unexpected response format:', response.data);
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error.response || error);
        // Show an error message to the user
        alert('Could not load messages. Please try again later.');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact, navigate]);

  const handleContactSelect = (contact) => {
    // Clear current messages to avoid showing previous conversation
    setMessages([]);
    setIsTyping(false);
    setSelectedContact(contact);
    
    // Focus on input field after selecting a contact
    setTimeout(() => {
      document.querySelector('.message-input-form input')?.focus();
    }, 100);
  };



  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedContact) return;

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');
    
    if (!userId || !token) return;

    try {
      // Temporary optimistic message ID for easy replacement
      const tempId = `temp-${Date.now()}`;
      
      // Create optimistic message object
      const optimisticMessage = {
        _id: tempId,
        sender: userId,
        receiver: selectedContact._id,
        content: newMessage,
        timestamp: new Date(),
        isOptimistic: true,
        reactions: [],
        read: false,
        isVanishing: isVanishingMode,
        vanishAfterSeconds: isVanishingMode ? 30 : 0
      };

      // Optimistically update UI
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);

      // Clear input field
      setNewMessage('');

      // Send message via HTTP request to ensure persistence
      const response = await API.post(
        `/user/${userId}/receiver/${selectedContact._id}/message/send`,
        { 
          content: newMessage,
          isVanishing: isVanishingMode,
          messageType: 'text'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Message send response:', response.data);

      // Replace the optimistic message with the actual saved message
      if (response.data.success && response.data.messageDetails) {
        const savedMessage = response.data.messageDetails;
        
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            // If this is our optimistic message, replace it with the real one
            msg._id === tempId ? {
              ...savedMessage,
              isOptimistic: false
            } : msg
          )
        );
      }

      // Only emit via socket if we have an active connection
      if (socket) {
        // Send message via socket for real-time delivery
        socket.emit('send_message', {
          senderId: userId,
          receiverId: selectedContact._id,
          content: newMessage,
          _id: response.data.messageDetails?._id
        });

        // Stop typing indicator
        socket.emit('typing', {
          senderId: userId,
          receiverId: selectedContact._id,
          isTyping: false
        });
      }
    } catch (error) {
      console.error('Error sending message:', error.response || error);
      // Remove the optimistic message
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isOptimistic));
      // Notify user of error
      alert('Failed to send message. Please try again.');
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('accessToken');
    
    if (!userId || !token) return;

    try {
      await API.post(
        `/user/message/${messageId}/reaction`,
        { userId, emoji },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { 
              ...msg, 
              reactions: [...(msg.reactions || []), { userId, emoji, timestamp: new Date() }] 
            }
          : msg
      ));

      setShowReactions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };



  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      <Sidebar user={user} />
      <div className="messaging-container">
        {/* Contacts sidebar - enhanced with group options */}
        <div className="contacts-sidebar">
          <div className="contacts-header">
            <h2>Messages</h2>
            <div className="header-actions">
              <button 
                className="icon-button"
                onClick={() => setGroupMode(!groupMode)}
                title={groupMode ? "Switch to DMs" : "Create Group"}
              >
                <Users size={20} />
              </button>
              <button className="icon-button" title="Settings">
                <Settings size={20} />
              </button>
            </div>
          </div>
          
          {groupMode && (
            <div className="group-creation">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="group-name-input"
              />
              <button 
                className="create-group-btn"
                onClick={() => {
                  // Create group logic here
                  console.log('Creating group:', groupName);
                }}
              >
                Create Group
              </button>
            </div>
          )}
          
          <div className="contacts-list">
            {contacts.length > 0 ? (
              // Group and sort contacts: messaged contacts first, sorted by most recent
              [...contacts]
                .sort((a, b) => {
                  // First criteria: contacts with messages come before those without
                  if (a.hasMessaged && !b.hasMessaged) return -1;
                  if (!a.hasMessaged && b.hasMessaged) return 1;
                  
                  // Second criteria: sort by most recent message
                  if (a.lastMessage && b.lastMessage) {
                    return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
                  }
                  
                  // If neither has messages, sort by name
                  return (a.name || '').localeCompare(b.name || '');
                })
                .map((contact) => (
                <div
                  key={contact._id}
                  className={`contact-item ${selectedContact && selectedContact._id === contact._id ? 'active' : ''} ${contact.hasMessaged ? 'has-messages' : ''}`}
                  onClick={() => handleContactSelect(contact)}
                >
                  <div className="contact-avatar">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} />
                    ) : (
                      <User size={28} />
                    )}
                  </div>
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    {contact.lastMessage && (
                      <div className="contact-last-message">
                        <span className={`message-preview ${contact.lastMessage.isFromUser ? 'sent' : 'received'}`}>
                          {contact.lastMessage.isFromUser ? 'You: ' : ''}
                          {contact.lastMessage.content.length > 25 
                            ? `${contact.lastMessage.content.substring(0, 25)}...` 
                            : contact.lastMessage.content}
                        </span>
                        <span className="message-time">
                          {formatTimeAgo(contact.lastMessage.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-contacts">
                <p>No contacts available</p>
                <span>Follow users to start messaging them</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat container - enhanced with Instagram features */}
        {selectedContact ? (
          <div className="chat-container">
            <div className="chat-header">
              <div className="contact-info">
                <div className="contact-avatar-large">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt={selectedContact.name} />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div className="contact-details">
                  <h3 className="contact-name">{selectedContact.name}</h3>
                  <span className="online-status">Online</span>
                </div>
              </div>
              
              <div className="chat-actions">
                <button className="icon-button" title="Voice call">
                  <Phone size={20} />
                </button>
                <button className="icon-button" title="Video call">
                  <Video size={20} />
                </button>
                <button 
                  className={`icon-button ${showActivityTracker ? 'active' : ''}`} 
                  onClick={() => setShowActivityTracker(!showActivityTracker)}
                  title="Activity Tracker"
                >
                  <Activity size={20} />
                </button>
                <button className="icon-button" title="More options">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const userId = localStorage.getItem('userId');
                  const isSent = message.sender === userId;
                  const isMentioned = message.mentions?.some(m => m.userId === userId);
                  
                  // Get sender name for the message
                  const senderName = isSent ? 'You' : (message.sender?.name || message.sender?.username || 'User');
                  
                  return (
                    <div
                      key={message._id}
                      className={`message ${isSent ? 'sent' : 'received'} ${isMentioned ? 'mentioned' : ''}`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedMessage(message);
                        setShowReactions(true);
                      }}
                      title={`${senderName} sent this message at ${new Date(message.timestamp).toLocaleTimeString()}`}
                    >
                      {/* Reply indicator */}
                      {message.repliedTo && (
                        <div className="reply-indicator">
                          <Reply size={12} />
                          <span>Replying to: {message.replyContent}</span>
                        </div>
                      )}
                      
                      {/* Message content */}
                      <div className="message-content">
                        {/* Show sender name for both sent and received messages */}
                        <div className="message-identifier">
                          <span className={isSent ? 'sent-by' : 'received-from'}>
                            {senderName}
                          </span>
                        </div>
                        {message.content}
                        {message.mediaUrl && (
                          <div className="message-media">
                            {message.messageType === 'image' && (
                              <img src={message.mediaUrl} alt="Shared media" />
                            )}
                            {message.messageType === 'video' && (
                              <video src={message.mediaUrl} controls />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Message metadata */}
                      <div className="message-meta">
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {/* Read receipts */}
                        {isSent && message.read && (
                          <span className="read-receipt">✓✓</span>
                        )}
                        
                        {/* Vanishing mode indicator */}
                        {message.isVanishing && (
                          <span className="vanish-indicator" title="Vanishing message">
                            <EyeOff size={12} />
                          </span>
                        )}
                      </div>
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="message-reactions">
                          {message.reactions.map((reaction, idx) => (
                            <span key={idx} className="reaction">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-messages">
                  <p>No messages yet. Say hello!</p>
                </div>
              )}
              
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Enhanced message input with Instagram features */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <div className="input-actions">
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  title="Media options"
                >
                  <Camera size={20} />
                </button>
                
                <button 
                  type="button" 
                  className="icon-button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Emoji"
                >
                  <Smile size={20} />
                </button>
                
                <button 
                  type="button" 
                  className={`icon-button ${isVanishingMode ? 'active' : ''}`}
                  onClick={() => setIsVanishingMode(!isVanishingMode)}
                  title="Vanishing mode"
                >
                  <Eye size={20} />
                </button>
              </div>
              
              <input
                type="text"
                placeholder={isVanishingMode ? "Vanishing message..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Handle typing indicator
                  if (!socket || !selectedContact) return;
                  
                  if (typingTimeout) clearTimeout(typingTimeout);
                  
                  socket.emit('typing', {
                    senderId: user?._id,
                    receiverId: selectedContact._id,
                    isTyping: true
                  });
                  
                  const timeout = setTimeout(() => {
                    socket.emit('typing', {
                      senderId: user?._id,
                      receiverId: selectedContact._id,
                      isTyping: false
                    });
                  }, 2000);
                  
                  setTypingTimeout(timeout);
                }}
              />
              
              <button type="submit" disabled={!newMessage.trim()}>
                <Send size={24} />
              </button>
            </form>
            
            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setNewMessage(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="emoji-button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            {/* Reactions menu */}
            {showReactions && selectedMessage && (
              <div className="reactions-menu">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(selectedMessage._id, emoji)}
                    className="reaction-button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
            {/* Activity Tracker */}
            {showActivityTracker && selectedContact && (
              <div className="activity-tracker-overlay">
                <UserActivityTracker 
                  userId={user?._id} 
                  targetUserId={selectedContact._id}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <MessageSquare size={48} />
              <h3>Select a conversation</h3>
              <p>Choose a person from your contacts to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;