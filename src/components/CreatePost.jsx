import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function CreatePost({ onPostCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const content = watch('content', '');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !loggedInUser) {
      navigate('/login');
    } else {
      setUser(loggedInUser);
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // const response = await fetch('https://microblog.efeuzel.com.tr/api/Blogs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${user?.token}`
      //   },
      //   body: JSON.stringify({
      //     title: data.title || "Başlıksız",
      //     summary: data.summary || "",
      //     content: data.content
      //   })

      const response = await fetch('https://microblog.efeuzel.com.tr/api/Blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`

        },
        body: JSON.stringify({
          title: data.title || "Başlıksız",
          summary: data.summary || "",
          content: data.content
        })
      });




      // if (!response.ok) {
      //   const errorData = await response.json();
      //   console.error('Hata:', errorData);
      //   alert('Post oluşturulurken bir hata oluştu.');
      // } else {
      //   const newPost = await response.json();
      //   onPostCreated(newPost);
      //   reset();
      // }

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {

        }
        console.error('Hata:', errorData);
        alert('Post oluşturulurken bir hata oluştu.');
      } else {
        const rawPost = await response.json();


        const formattedPost = {
          id: rawPost.blogId,
          username: user?.userName || 'Kullanıcı',
          authorUserName: user?.userName || 'kullanici',
          content: data.content,
          title: data.title,
          summary: data.summary,
          timestamp: new Date().toLocaleString('tr-TR'),
          replies: 0,
          retweets: 0,
          likes: 0,
          avatar: 'https://via.placeholder.com/48x48/1da1f2/ffffff?text=U'
        };


        onPostCreated(formattedPost);

        reset();
      }


    } catch (error) {
      console.error('Fetch hatası:', error);
      alert('Sunucuya ulaşılamıyor.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const remainingChars = 280 - content.length;

  return (
    <div className="x-post">
      <div className="d-flex">
        <img
          src="https://via.placeholder.com/48x48/1da1f2/ffffff?text=U"
          alt="Avatar"
          className="x-avatar me-3"
        />
        <div className="flex-grow-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register('title', { required: 'Başlık zorunlu' })}
              className="form-control mb-2"
              placeholder="Başlık"
            />
            {errors.title && <div className="text-danger small">{errors.title.message}</div>}

            <input
              {...register('summary')}
              className="form-control mb-2"
              placeholder="Özet (isteğe bağlı)"
            />

            <textarea
              {...register('content', {
                required: 'Post içeriği gereklidir',
                maxLength: { value: 280, message: 'Maksimum 280 karakter' }
              })}
              className="form-control x-form-control border-0 bg-transparent text-white"
              placeholder="Neler oluyor?"
              rows="3"
              style={{ resize: 'none' }}
            />
            {errors.content && (
              <div className="text-danger small mt-1">{errors.content.message}</div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className={`small ${remainingChars < 20 ? 'text-warning' : 'text-muted'}`}>
                <span>{remainingChars}</span> karakter kaldı
              </div>
              <button
                type="submit"
                className="btn x-btn-primary rounded-pill px-4"
                disabled={isSubmitting || remainingChars < 0}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


