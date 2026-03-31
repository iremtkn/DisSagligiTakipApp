import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [displayPassword, setDisplayPassword] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    if (value.length < displayPassword.length) {
      const newPassword = credentials.password.slice(0, -1);
      setCredentials({ ...credentials, password: newPassword });
      setDisplayPassword('*'.repeat(newPassword.length));
      return;
    }

    const newChar = value[value.length - 1];
    const newPassword = credentials.password + newChar;
    setCredentials({ ...credentials, password: newPassword });
    setDisplayPassword('*'.repeat(newPassword.length));
  };

  const handleLogin = async () => {
    let valid = true;

    if (!credentials.email) {
      setEmailError('E-posta adresi boş bırakılamaz.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!credentials.password) {
      setPasswordError('Parola boş bırakılamaz.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    try {
      const response = await axios.post(
        'http://localhost:5259/api/auth/login',
        {
          email: credentials.email,
          password: credentials.password
        }
      );

      const userToSave = response.data.user || response.data;
      localStorage.setItem('user', JSON.stringify(userToSave));

      alert("Giriş başarılı!");
      navigate('/dashboard');

    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setEmailError('Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.');
        } else if (error.response.status === 401) {
          setPasswordError('Girdiğiniz parola hatalı.');
        } else {
          setEmailError('Giriş başarısız. Lütfen tekrar deneyin.');
        }
      } else {
        setEmailError('Sunucuya bağlanılamadı.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <span className="login-icon">🔐</span>
        <h2>Giriş Yap</h2>
        <p className="login-subtitle">Devam etmek için giriş yapın.</p>

        <div className="login-form">

          <div className={`login-field ${emailError ? 'has-error' : ''}`}>
            <label className="login-label">E-posta Adresi</label>
            <input
              type="email"
              placeholder="ornek@gmail.com"
              className="login-input"
              value={credentials.email}
              onChange={(e) => {
                setCredentials({ ...credentials, email: e.target.value });
                if (emailError) setEmailError('');
              }}
            />
            {emailError && <p className="login-error-msg">{emailError}</p>}
          </div>

          <div className={`login-field ${passwordError ? 'has-error' : ''}`}>
            <label className="login-label">Parola</label>
            <input
              type="text"
              placeholder="••••••••"
              className="login-input"
              value={displayPassword}
              onChange={handlePasswordChange}
            />
            {passwordError && <p className="login-error-msg">{passwordError}</p>}
          </div>

          <button onClick={handleLogin} className="login-button">
            Giriş Yap
          </button>

          <p className="redirect-text" style={{ marginTop: '14px' }}>
            <span className="link" onClick={() => navigate('/forgot-password')}>
              Parolamı Unuttum
            </span>
          </p>

          <div className="login-divider"><span>veya</span></div>

          <p className="redirect-text">
            Henüz hesabınız yok mu?{' '}
            <span className="link" onClick={() => navigate('/register')}>
              Kayıt Ol →
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;