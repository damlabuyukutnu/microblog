import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function Post({ post, onCommentAdded, onLikeUpdated, onPostDeleted }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likedComments, setLikedComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [visibleComments, setVisibleComments] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerReply, handleSubmit: handleSubmitReply, reset: resetReply, formState: { errors: errorsReply } } = useForm();

  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (!post?.id || !token) return;

    fetchComments();
    setIsLiked(post.isLiked || false);
    setLikeCount(post.likes || 0);
  }, [post.id, token]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`https://microblog.efeuzel.com.tr/api/Comments/blog/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleCommentSubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    const payload = {
      text: data.comment,
      blogId: post.id,
      parentCommentId: null
    };

    try {
      const res = await fetch("https://microblog.efeuzel.com.tr/api/Comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchComments();
        onCommentAdded?.(post.id, comments.length + 1);
        reset();
        setShowCommentForm(false);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentReplySubmit = async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    const payload = {
      text: data.comment,
      blogId: post.id,
      parentCommentId: replyingToComment
    };

    try {
      const res = await fetch("https://microblog.efeuzel.com.tr/api/Comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchComments();
        onCommentAdded?.(post.id, comments.length + 1);
        resetReply();
        setReplyingToComment(null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser || isLiked || isLoading) return; // zaten beğendiyse tekrar gönderme

    setIsLoading(true);
    const originalCount = likeCount;

    setIsLiked(true);
    setLikeCount(prev => prev + 1);

    try {
      const res = await fetch(`https://microblog.efeuzel.com.tr/api/Like/blog/${post.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {

        setIsLiked(false);
        setLikeCount(originalCount);
        const errorText = await res.text();
        console.error("Like failed:", res.status, errorText);
      } else {
        onLikeUpdated?.(post.id, likeCount + 1);
      }
    } catch (error) {
      setIsLiked(false);
      setLikeCount(originalCount);
      console.error("Like error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const toggleCommentLike = async (commentId) => {
    if (!currentUser) return;

    const alreadyLiked = likedComments.includes(commentId);
    const method = alreadyLiked ? "DELETE" : "POST";


    setLikedComments(prev =>
      alreadyLiked ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );

    try {
      const res = await fetch(`https://microblog.efeuzel.com.tr/api/Like/comment/${commentId}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,

        }
      });

      if (!res.ok) {

        setLikedComments(prev =>
          alreadyLiked ? [...prev, commentId] : prev.filter(id => id !== commentId)
        );
        const errorText = await res.text();
        console.error('Comment like failed:', res.status, errorText);
      }
    } catch (error) {
      setLikedComments(prev =>
        alreadyLiked ? [...prev, commentId] : prev.filter(id => id !== commentId)
      );
      console.error('Error toggling comment like:', error);
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`https://microblog.efeuzel.com.tr/api/Comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        onCommentAdded?.(post.id, comments.length - 1);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Bu gönderiyi silmek istediğinizden emin misiniz?')) return;

    try {
      const res = await fetch(`https://microblog.efeuzel.com.tr/api/Blogs/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onPostDeleted?.(post.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const loadMoreComments = () => setVisibleComments(prev => prev + 3);
  const handleReplyToComment = (id) => setReplyingToComment(id);


  const renderSubComment = (subComment) => {
    const isOwner = currentUser?.userName === subComment.authorUserName;
    const displayName = subComment.authorUserName || 'Anonim';
    const avatar = `https://via.placeholder.com/28x28/1da1f2/ffffff?text=${displayName.charAt(0)}`;

    return (
      <div key={subComment.id} className="mb-2 ms-4">
        <div className="d-flex">
          <img
            src={avatar}
            alt="Avatar"
            className="rounded-circle me-2"
            style={{ width: '28px', height: '28px' }}
          />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold text-white me-2 small">{displayName}</span>
              <span className="text-muted small">@{subComment.authorUserName}</span>
              <span className="text-muted ms-2 small">·</span>
              <span className="text-muted ms-2 small">{subComment.createdDate}</span>
            </div>
            <p className="text-white mb-1 small">{subComment.text}</p>
            <div className="d-flex text-muted small">
              <button
                className="btn btn-link text-muted p-0 me-3 small"
                onClick={() => toggleCommentLike(subComment.id)}
                disabled={!currentUser}
              >
                <i className={`bi ${likedComments.includes(subComment.id) ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>
                {subComment.likes || 0}
              </button>
              {isOwner && (
                <button
                  className="btn btn-link text-muted p-0 small"
                  onClick={() => handleDeleteComment(subComment.id)}
                >
                  <i className="bi bi-trash me-1"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderComment = (comment) => {
    const isOwner = currentUser?.userName === comment.authorUserName;
    const displayName = comment.authorUserName || 'Anonim';
    const avatar = `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${displayName.charAt(0)}`;

    return (
      <div key={comment.id} className="mb-3">
        <div className="d-flex">
          <img
            src={avatar}
            alt="Avatar"
            className="rounded-circle me-2"
            style={{ width: '32px', height: '32px' }}
          />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <span className="fw-bold text-white me-2">{displayName}</span>
              <span className="text-muted">@{comment.authorUserName}</span>
              <span className="text-muted ms-2">·</span>
              <span className="text-muted ms-2">{comment.createdDate}</span>
            </div>
            <p className="text-white mb-1">{comment.text}</p>
            <div className="d-flex text-muted small">
              <button
                className="btn btn-link text-muted p-0 me-3"
                onClick={() => toggleCommentLike(comment.id)}
                disabled={!currentUser}
              >
                <i className={`bi ${likedComments.includes(comment.id) ? 'bi-heart-fill text-danger' : 'bi-heart'} me-1`}></i>
                {comment.likes || 0}
              </button>
              <button
                className="btn btn-link text-muted p-0 me-3"
                onClick={() => handleReplyToComment(comment.id)}
                disabled={!currentUser}
              >
                <i className="bi bi-reply me-1"></i>
                Yanıtla
              </button>
              {isOwner && (
                <button
                  className="btn btn-link text-muted p-0"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <i className="bi bi-trash me-1"></i>
                </button>
              )}
            </div>
          </div>
        </div>


        {comment.subComments && comment.subComments.length > 0 && (
          <div className="mt-2">
            {comment.subComments.map(subComment => renderSubComment(subComment))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="x-post">
      <div className="d-flex">
        <img
          src={post.avatar || 'https://via.placeholder.com/48x48/1da1f2/ffffff?text=U'}
          alt="Avatar"
          className="x-avatar me-3"
        />
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-1">
            <span className="fw-bold text-white me-2">{post.userName}</span>
            <span className="text-muted">@{post.authorUserName}</span>
            <span className="text-muted ms-2">·</span>
            <span className="text-muted ms-2">{post.timestamp}</span>
          </div>
          <p className="text-white mb-2">{post.content}</p>

          {/* Beğeni,yorum butonları */}
          <div className="d-flex justify-content-between text-muted mb-3">
            <button
              className="btn btn-link text-muted p-0 me-3"
              onClick={(e) => {
                e.preventDefault();
                setShowCommentForm(!showCommentForm);
              }}
              disabled={!currentUser}
            >
              <i className="bi bi-chat me-1"></i>
              {formatNumber(post.replies || comments.length)}
            </button>
            <button
              className={`btn btn-link p-0 ${isLiked ? 'text-danger' : 'text-muted'}`}
              onClick={handleLike}
              disabled={!currentUser || isLoading}
            >
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
              {formatNumber(likeCount)}
            </button>

            {currentUser?.userName === post.authorUserName ? (
              <button
                className="btn btn-link text-muted p-0"
                onClick={handleDeletePost}
              >
                <i className="bi bi-trash me-1"></i>
              </button>
            ) : (
              <div style={{ width: '40px' }}></div>
            )}
          </div>

          {/* YORUM FORMU */}
          {currentUser && showCommentForm && !replyingToComment && (
            <div className="mb-3 p-3 bg-dark rounded">
              <form onSubmit={handleSubmit(handleCommentSubmit)}>
                <div className="d-flex">
                  <img
                    src={currentUser.avatar || `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <div className="flex-grow-1">
                    <textarea
                      {...register('comment', {
                        required: 'Yorum gereklidir',
                        maxLength: { value: 500, message: 'Maksimum 500 karakter' }
                      })}
                      className="form-control x-form-control border-0 bg-transparent text-white"
                      placeholder="Yorumunuzu yazın..."
                      rows="2"
                      style={{ resize: 'none' }}
                    />
                    {errors.comment && (
                      <div className="text-danger small mt-1">{errors.comment.message}</div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="text-muted small">
                        <span>500</span> karakter limit
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-link text-muted me-2"
                          onClick={() => setShowCommentForm(false)}
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="btn x-btn-primary rounded-pill px-3"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Gönderiliyor...' : 'Yorumla'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Yoruma yanıt formu */}
          {currentUser && replyingToComment && (
            <div className="mb-3 p-3 bg-dark rounded">
              <div className="text-muted small mb-2">
                @{comments.find(c => c.id === replyingToComment)?.authorUserName || 'kullanıcı'} kullanıcısına yanıt veriyorsunuz
              </div>
              <form onSubmit={handleSubmitReply(handleCommentReplySubmit)}>
                <div className="d-flex">
                  <img
                    src={currentUser.avatar || `https://via.placeholder.com/32x32/1da1f2/ffffff?text=${currentUser?.fullName?.charAt(0) || 'U'}`}
                    alt="Avatar"
                    className="rounded-circle me-2"
                    style={{ width: '32px', height: '32px' }}
                  />
                  <div className="flex-grow-1">
                    <textarea
                      {...registerReply('comment', {
                        required: 'Yanıt gereklidir',
                        maxLength: { value: 500, message: 'Maksimum 500 karakter' }
                      })}
                      className="form-control x-form-control border-0 bg-transparent text-white"
                      placeholder="Yanıtınızı yazın..."
                      rows="2"
                      style={{ resize: 'none' }}
                    />
                    {errorsReply.comment && (
                      <div className="text-danger small mt-1">{errorsReply.comment.message}</div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="text-muted small">
                        <span>500</span> karakter limit
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-link text-muted me-2"
                          onClick={() => setReplyingToComment(null)}
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          className="btn x-btn-primary rounded-pill px-3"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Gönderiliyor...' : 'Yanıtla'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Yorumlar */}
          {comments.length > 0 && (
            <div className="border-top border-secondary pt-3">
              <h6 className="text-muted mb-3">Yorumlar ({comments.length})</h6>
              {comments.slice(0, visibleComments).map(comment => renderComment(comment))}

              {/* Load More butonu */}
              {visibleComments < comments.length && (
                <div className="text-center mt-3">
                  <button
                    className="btn btn-link text-primary"
                    onClick={loadMoreComments}
                  >
                    Daha fazla yorum göster ({comments.length - visibleComments} kaldı)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}