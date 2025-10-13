import React, { useState, useEffect } from 'react';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://microblog.efeuzel.com.tr/api/Blogs/all");

        if (!response.ok) throw new Error("Postlar alınamadı");

        const data = await response.json();

        const postsWithId = data.map(post => ({
          ...post,
          id: post.blogId,
        }));

        const sortedPosts = postsWithId.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Hata:", error);
      }
    };

    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleCommentAdded = (postId, commentCount) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, replies: commentCount }
        : post
    ));
  };

  const handleLikeUpdated = (postId, newLikeCount) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: newLikeCount }
        : post
    ));
  };

  const handlePostDeleted = async (postId) => {
    try {
      if (!currentUser) {
        alert('Lütfen giriş yapınız.');
        return;
      }

      const postToDelete = posts.find(post => post.id === postId);
      if (!postToDelete) {
        alert('Post bulunamadı.');
        return;
      }

      if (postToDelete.authorUserName !== currentUser.userName) {
        alert('Sadece kendi postunuzu silebilirsiniz.');
        return;
      }

      const response = await fetch(`https://microblog.efeuzel.com.tr/api/Blogs/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.accessToken}`
        }
      });



      if (!response.ok) {
        throw new Error('Post silme işlemi başarısız oldu.');
      }

      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="x-container">
      <div className="border-bottom border-secondary">
        <h2 className="text-white p-3 mb-0">Ana Sayfa</h2>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      <div className="border-top border-secondary">
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
            onLikeUpdated={handleLikeUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center text-muted py-5">
          <p>Henüz post yok. İlk postunu paylaş!</p>
        </div>
      )}
    </div>
  );
};