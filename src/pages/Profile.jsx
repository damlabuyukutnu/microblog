import React, { useState, useEffect } from 'react';
import Post from '../components/Post';
import { useNavigate } from 'react-router-dom';


export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [userLikedPosts, setUserLikedPosts] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();


  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

 
    if (currentUser) {
      const allUserPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');


      const filteredPosts = allUserPosts.filter(post =>
        post.authorUserName === currentUser.username
      );
      setUserPosts(filteredPosts);


      const userComments = [];
      allUserPosts.forEach(post => {
        const comments = JSON.parse(localStorage.getItem(`comments_${post.id}`) || '[]');
        const userCommentsForPost = comments.filter(comment =>
          comment.authorUserName === currentUser.username
        );
        userComments.push(...userCommentsForPost);
      });
      setUserReplies(userComments);

      const likedPostIds = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      const likedPosts = allUserPosts.filter(post =>
        likedPostIds.includes(post.id)
      );
      setUserLikedPosts(likedPosts);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/'
  };

  const handleCommentAdded = (postId, commentCount) => {
    setUserPosts(userPosts.map(post =>
      post.id === postId
        ? { ...post, replies: commentCount }
        : post
    ));
  };

  const handleLikeUpdated = (postId, newLikeCount) => {
    setUserPosts(userPosts.map(post =>
      post.id === postId
        ? { ...post, likes: newLikeCount }
        : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setUserPosts(userPosts.filter(post => post.id !== postId));
  };

  if (!user) {
    return (
      <div className="x-container">
        <div className="text-center py-5">
          <h3 className="text-white mb-3">Giriş yapmanız gerekiyor</h3>
          <p className="text-muted">Profilinizi görmek için lütfen giriş yapın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="x-container">
      {/* Profil Başlığı */}
      <div className="border-bottom border-secondary">
        <div className="d-flex align-items-center p-3" onClick={() => navigate('/')}>
          <button className="btn btn-link text-white me-3">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h5 className="text-white mb-0">{user.fullName || user.username}</h5>
            <small className="text-muted">{userPosts.length} post</small>
          </div>
        </div>
      </div>

      {/* Profil bilgileri */}
      <div className="p-3">
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://via.placeholder.com/80x80/1da1f2/ffffff?text=T"
            alt="Profil"
            className="rounded-circle me-3"
            style={{ width: '80px', height: '80px' }}
          />
          <div className="flex-grow-1">
            <h4 className="text-white mb-1">{user.fullName || user.username}</h4>
            <p className="text-muted mb-1">@{user.userName || 'testuser'}</p>
            <p className="text-white mb-2">Frontend Developer | React.js | JavaScript</p>
            <div className="d-flex text-muted small mb-2">
              <span className="me-3">
                <i className="bi bi-geo-alt me-1"></i>
                Tekirdağ, Türkiye
              </span>
              <span className="me-3">
                <i className="bi bi-calendar me-1"></i>
                Katıldı: Ocak 2024
              </span>
            </div>
            <div className="d-flex text-muted small">
              <span className="me-3">
                <strong className="text-white">42</strong> takip edilen
              </span>
              <span>
                <strong className="text-white">128</strong> takipçi
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-outline-light rounded-pill px-4">
            Profili Düzenle
          </button>
          <button
            className="btn btn-outline-danger rounded-pill px-4"
            onClick={handleLogout}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Tab butonları */}
      <div className="border-top border-secondary">
        <div className="d-flex">
          <button
            className={`flex-grow-1 py-3 border-0 bg-transparent text-white ${activeTab === 'posts' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Postlar
          </button>
          <button
            className={`flex-grow-1 py-3 border-0 bg-transparent text-white ${activeTab === 'replies' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setActiveTab('replies')}
          >
            Yanıtlar
          </button>
          <button
            className={`flex-grow-1 py-3 border-0 bg-transparent text-white ${activeTab === 'media' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            Medya
          </button>
          <button
            className={`flex-grow-1 py-3 border-0 bg-transparent text-white ${activeTab === 'likes' ? 'border-bottom border-primary' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Beğeniler
          </button>
        </div>
      </div>

      {/* Tab içerikleri */}
      <div className="border-top border-secondary">
        {activeTab === 'posts' && (
          <div>
            {userPosts.length > 0 ? (
              userPosts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  onCommentAdded={handleCommentAdded}
                  onLikeUpdated={handleLikeUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Henüz post yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'replies' && (
          <div>
            {userReplies.length > 0 ? (
              userReplies.map(reply => (
                <div key={reply.id} className="x-post">
                  <div className="d-flex">
                    <img
                      src={reply.avatar}
                      alt="Avatar"
                      className="x-avatar me-3"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-bold text-white me-2">{reply.username}</span>
                        <span className="text-muted">@{reply.handle}</span>
                        <span className="text-muted ms-2">·</span>
                        <span className="text-muted ms-2">{reply.timestamp}</span>
                      </div>
                      <p className="text-white mb-2">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Henüz yanıt yok</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="text-center py-5">
            <p className="text-muted">Henüz medya yok</p>
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            {userLikedPosts.length > 0 ? (
              userLikedPosts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  onCommentAdded={handleCommentAdded}
                  onLikeUpdated={handleLikeUpdated}
                />
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Henüz beğeni yok</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};