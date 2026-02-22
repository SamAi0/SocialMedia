import React, { useState } from 'react';
import CreatePostResponsive from '../components/CreatePostResponsive';
import '../styles/CreatePostResponsive.css';

const CreatePostDemoPage = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [demoUser] = useState({
    id: '1',
    name: 'John Doe',
    avatar: '/assets/default-avatar.svg'
  });

  const handlePostCreated = async (post) => {
    console.log('Post created:', post);
    setPosts(prev => [post, ...prev]);
    setShowCreatePost(false);
  };

  const handleCancel = () => {
    setShowCreatePost(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Responsive Create Post Demo
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => setShowCreatePost(true)}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            Create New Post
          </button>
        </div>

        {showCreatePost && (
          <CreatePostResponsive
            onPostCreated={handlePostCreated}
            onCancel={handleCancel}
            currentUser={demoUser}
          />
        )}

        {/* Demo content to show scrolling behavior */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Demo Content Below (to demonstrate scrolling)
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {[...Array(20)].map((_, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minHeight: '200px'
                }}
              >
                <h3>Demo Card #{index + 1}</h3>
                <p>This is sample content to demonstrate the scrolling behavior of the page. The Create Post component should maintain proper scrolling behavior even when the page content is long.</p>
                <p>Scroll down to see more content...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostDemoPage;