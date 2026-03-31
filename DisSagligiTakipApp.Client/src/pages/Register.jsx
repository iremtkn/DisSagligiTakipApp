import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [user, setUser] = useState({
        FirstName: '',
        LastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: ''
    });

    const navigate = useNavigate(); 

    const isEmailValid = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRegister = async () => {
        if (!user.FirstName || !user.LastName || !user.email || !user.password || !user.confirmPassword || !user.birthDate) {
            alert("Lütfen tüm alanları doldurun");
            return;
        }

        if (!isEmailValid(user.email)) {
            alert("Geçerli bir email giriniz");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(user.password)) {
            alert("Şifre en az 8 karakter olmalı; büyük harf, küçük harf ve rakam içermelidir!");
            return;
        }

        if (user.password !== user.confirmPassword) {
            alert("Şifreler uyuşmuyor");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5259/api/auth/register', {
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.email,
                Password: user.password,
                BirthDate: user.birthDate
            });
            alert(response.data.message);
            navigate('/login'); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Kayıt sırasında bir hata oluştu.";
            alert("Hata: " + errorMsg);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="icon-section">
                    <span style={{ fontSize: '50px' }}>🦷</span>
                    <h2 className="title">Diş Sağlığı Takip</h2>
                </div>

                <div className="register-form">
                    <div className="input-group">
                        <label>Adınız</label>
                        <input
                            type="text"
                            placeholder="Ad"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, FirstName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Soyadınız</label>
                        <input
                            type="text"
                            placeholder="Soyad"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, LastName: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>E-posta</label>
                        <input
                            type="email"
                            placeholder="ornek@gmail.com"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Doğum Tarihi</label>
                        <input
                            type="date"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Şifre Tekrar</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="register-input"
                            onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                        />
                    </div>

                    <button onClick={handleRegister} className="register-button">Kaydı Tamamla</button>
                    
                    <p style={{ textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '15px' }}>
                        Zaten üye misiniz?{" "}
                        <span 
                            className="register-link"
                            onClick={() => navigate('/login')}
                        >
                            Giriş Yap 
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;