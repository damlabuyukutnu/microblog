import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import '../Register.css'


export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setRegisterError('');
  
    try {
      const response = await fetch('https://microblog.efeuzel.com.tr/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: data.username,
          email: data.email,
          password: data.password,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setRegisterError(errorData.message || 'Kayıt sırasında bir hata oluştu');
        setIsSubmitting(false);
        return;
      }
  


      localStorage.setItem('isLoggedIn', true);

  
      navigate('/');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setRegisterError('Sunucuya bağlanılamadı');
    }
  
    setIsSubmitting(false);
  };
  

  return (
    <div className="login-container">
      <div className="card">
        <div>
            <h2>★</h2>
            <h2>Hesap oluştur</h2>
          </div>

            <div className="card-body">
              {registerError && (
                <div className="alert alert-danger" role="alert">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>


                <div>
                  <label htmlFor="username" className="form-label text-white">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    id="username"
                    {...register('username', {
                      required: 'Kullanıcı adı gereklidir',
                      minLength: { value: 3, message: 'Kullanıcı adı en az 3 karakter olmalıdır' },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'
                      }
                    })}
                    className="form-control x-form-control"
                    placeholder="Kullanıcı adınızı girin"
                  />
                  {errors.username && (
                    <div className="text-danger small mt-1">{errors.username.message}</div>
                  )}
                </div>

                <div >
                  <label htmlFor="email" className="form-label text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email gereklidir',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Geçerli bir email adresi girin'
                      }
                    })}
                    className="form-control x-form-control"
                    placeholder="Email adresinizi girin"
                  />
                  {errors.email && (
                    <div className="text-danger small mt-1">{errors.email.message}</div>
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
                      minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
                      }
                    })}
                    className="form-control x-form-control"
                    placeholder="Şifrenizi girin"
                  />
                  {errors.password && (
                    <div className="text-danger small mt-1">{errors.password.message}</div>
                  )}
                </div>



                <div className="form-check">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    className="form-check-input"
                    {...register('agreeTerms', {
                      required: 'Kullanım şartlarını kabul etmelisiniz'
                    })}
                  />
                  <label className="form-check-label text-white" htmlFor="agreeTerms">
                    <small>
                      <Link to="/terms" className="text-primary">Kullanım şartlarını</Link> ve{' '}
                      <Link to="/privacy" className="text-primary">gizlilik politikasını</Link> kabul ediyorum
                    </small>
                  </label>
                  {errors.agreeTerms && (
                    <div className="text-danger small mt-1">{errors.agreeTerms.message}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="x-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                </button>
              </form>

              <div>
                <Link to="/login" className="text-decoration-none">
                  <span className="text-check">Zaten hesabın var mı? </span>
                  <span className="text-primary">Giriş yap</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      
    
  );
};

