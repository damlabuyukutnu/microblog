import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import '../Login.css';


export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  setIsSubmitting(true);
  setLoginError('');

  try {
    const response = await fetch('https://microblog.efeuzel.com.tr/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: data.username,
        password: data.password
      }),
    });

    
    if (response.ok) {
      const result = await response.json(); // ⬅ önce JSON’a çevir
      localStorage.setItem("accessToken", result.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(result));
      console.log("Giriş başarılı, token:", result.token);
      navigate('/');
    } else {
      console.error("Giriş başarısız:", result.message);
      setLoginError('Kullanıcı adı veya şifre hatalı');
    }

  } catch (error) {
    setLoginError('Bir hata oluştu');
    console.error('Login error:', error);
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <div className="login-container">
      <div className="card">
        <div>
          <h2>★</h2>
          <h2>Hesabına giriş yap</h2>
        </div>


        <div className="card-body">
          {loginError && (
            <div className="alert alert-danger" role="alert">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <div >
              <label htmlFor="text" className="form-label text-white">
                Kullanıcı adı
              </label>
              <input
                type="text"
                id="text"
                {...register('username', {
                  required: 'Kullanıcı adı gereklidir'

                })}
                className="form-control x-form-control"
                placeholder="Kullanıcı adı girin"
              />
              {errors.username && (
                <div className="text-danger">{errors.username.message}</div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label text-white">
                Şifre
              </label>
              <input
                type="password"
                id="password"
                {...register('password', {
                  required: 'Şifre gereklidir',
                  minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                })}
                className="form-control x-form-control"
                placeholder="Şifrenizi girin"
              />
              {errors.password && (
                <div className="text-danger">{errors.password.message}</div>
              )}
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="rememberMe"
                className="form-check-input"
                {...register('rememberMe')}
              />
              <label className="form-check-label text-white" htmlFor="rememberMe">
                Beni hatırla
              </label>
            </div>

            <button
              type="submit"
              className="x-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div>
            <Link to="/register" className="register-link">
              <span className="text-check">Hesabın yok mu? </span>
              <span className="text-primary">Kayıt ol</span>
            </Link>
          </div>

          {/* <div className="text-center">
          <Link to="/register" className="text-decoration-none">
            <span className="text-white">Hesabın yok mu? </span>
            <span className="text-primary">Kayıt ol</span>
          </Link>
        </div> */}


        </div>
      </div>
    </div>
  );
};

