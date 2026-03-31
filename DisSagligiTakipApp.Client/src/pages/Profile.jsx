import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API = 'http://localhost:5259/api';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Profile() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id;

    console.log('userData:', userData);
    console.log('userId:', userId);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            console.warn('userId bulunamadı, login sayfasına yönlendiriliyor');
            navigate('/login');
            return;
        }

        axios.get(`${API}/profile/${userId}`)
            .then(res => {
                console.log('Profil verisi:', res.data);
                setForm(f => ({
                    ...f,
                    firstName: res.data.firstName || res.data.FirstName || '',
                    lastName:  res.data.lastName  || res.data.LastName  || '',
                    email:     res.data.email     || res.data.Email     || '',
                    birthDate: res.data.birthDate
                        ? res.data.birthDate.split('T')[0]
                        : (res.data.BirthDate ? res.data.BirthDate.split('T')[0] : ''),
                }));
                setLoading(false);
            })
            .catch(err => {
                console.error('Profil yüklenemedi:', err);
                setErrors({ general: 'Profil bilgileri yüklenemedi. Backend çalışıyor mu?' });
                setLoading(false);
            });
    }, [userId, navigate]);

    const setField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
        setSuccessMsg('');
    };

    const validate = async () => {
        const newErrors = {};

        if (!form.firstName.trim())  newErrors.firstName = 'Ad boş bırakılamaz.';
        if (!form.lastName.trim())   newErrors.lastName  = 'Soyad boş bırakılamaz.';
        if (!form.birthDate)         newErrors.birthDate = 'Doğum tarihi boş bırakılamaz.';

        if (!form.email.trim()) {
            newErrors.email = 'E-posta boş bırakılamaz.';
        } else if (!emailRegex.test(form.email.trim())) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz.';
        } else {
            try {
                const res = await axios.get(`${API}/profile/check-email?email=${encodeURIComponent(form.email.trim())}&userId=${userId}`);
                if (!res.data.available) {
                    newErrors.email = 'Bu e-posta adresi başka bir kullanıcıya kayıtlı.';
                }
            } catch {
                
            }
        }

        if (form.newPassword) {
            if (!passwordRegex.test(form.newPassword)) {
                newErrors.newPassword = 'En az 8 karakter, büyük/küçük harf ve rakam içermelidir.';
            } else if (form.newPassword !== form.confirmPassword) {
                newErrors.confirmPassword = 'Parolalar uyuşmuyor.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        const valid = await validate();
        if (!valid) return;

        setSaving(true);
        try {
            const res = await axios.put(`${API}/profile/update`, {
                userId,
                firstName: form.firstName.trim(),
                lastName:  form.lastName.trim(),
                email:     form.email.trim(),
                birthDate: new Date(form.birthDate),
                newPassword: form.newPassword || null,
            });

            const updated = res.data.user;
            localStorage.setItem('user', JSON.stringify({ ...userData, ...updated }));

            setSuccessMsg('Profiliniz başarıyla güncellendi.');
            setForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
        } catch (err) {
            const msg = err.response?.data?.message || 'Güncelleme sırasında hata oluştu.';
            setErrors({ general: msg });
        } finally {
            setSaving(false);
        }
    };

    const displayName = form.firstName || userData?.firstName || 'Kullanıcı';

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>Yükleniyor...</p>
                    {errors.general && <div className="profile-error-banner">{errors.general}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-header">
                    <button className="profile-back" onClick={() => navigate('/dashboard')}>← Geri</button>
                    <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    <h2 className="profile-title">Profil Bilgileri</h2>
                    <p className="profile-subtitle">Bilgilerinizi güncelleyebilirsiniz.</p>
                </div>

                {errors.general && (
                    <div className="profile-error-banner">{errors.general}</div>
                )}

                {successMsg && (
                    <div className="profile-success-banner">✓ {successMsg}</div>
                )}

                <div className="profile-form">

                    <div className="profile-row">
                        <div className={`profile-field ${errors.firstName ? 'has-error' : ''}`}>
                            <label className="profile-label">Ad</label>
                            <input
                                type="text"
                                className="profile-input"
                                placeholder="Adınız"
                                value={form.firstName}
                                onChange={e => setField('firstName', e.target.value)}
                            />
                            {errors.firstName && <p className="profile-error-msg">{errors.firstName}</p>}
                        </div>

                        <div className={`profile-field ${errors.lastName ? 'has-error' : ''}`}>
                            <label className="profile-label">Soyad</label>
                            <input
                                type="text"
                                className="profile-input"
                                placeholder="Soyadınız"
                                value={form.lastName}
                                onChange={e => setField('lastName', e.target.value)}
                            />
                            {errors.lastName && <p className="profile-error-msg">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div className={`profile-field ${errors.email ? 'has-error' : ''}`}>
                        <label className="profile-label">E-posta Adresi</label>
                        <input
                            type="email"
                            className="profile-input"
                            placeholder="ornek@gmail.com"
                            value={form.email}
                            onChange={e => setField('email', e.target.value)}
                        />
                        {errors.email && <p className="profile-error-msg">{errors.email}</p>}
                    </div>

                    <div className={`profile-field ${errors.birthDate ? 'has-error' : ''}`}>
                        <label className="profile-label">Doğum Tarihi</label>
                        <input
                            type="date"
                            className="profile-input"
                            value={form.birthDate}
                            onChange={e => setField('birthDate', e.target.value)}
                        />
                        {errors.birthDate && <p className="profile-error-msg">{errors.birthDate}</p>}
                    </div>

                    <div className="profile-divider">
                        <span>Parola Değiştir</span>
                    </div>
                    <p className="profile-pass-hint">Parolayı değiştirmek istemiyorsanız bu alanları boş bırakın.</p>

                    <div className={`profile-field ${errors.newPassword ? 'has-error' : ''}`}>
                        <label className="profile-label">Yeni Parola</label>
                        <div className="profile-pass-row">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="profile-input"
                                placeholder="Yeni parolanız"
                                value={form.newPassword}
                                onChange={e => setField('newPassword', e.target.value)}
                            />
                            <button className="profile-eye" onClick={() => setShowPassword(v => !v)} type="button">
                                {showPassword ? '🙈' : '👁'}
                            </button>
                        </div>
                        {errors.newPassword && <p className="profile-error-msg">{errors.newPassword}</p>}
                        {form.newPassword && (
                            <ul className="profile-criteria">
                                <li className={form.newPassword.length >= 8 ? 'met' : ''}>En az 8 karakter</li>
                                <li className={/[A-Z]/.test(form.newPassword) ? 'met' : ''}>Büyük harf</li>
                                <li className={/[a-z]/.test(form.newPassword) ? 'met' : ''}>Küçük harf</li>
                                <li className={/\d/.test(form.newPassword) ? 'met' : ''}>Rakam</li>
                            </ul>
                        )}
                    </div>

                    <div className={`profile-field ${errors.confirmPassword ? 'has-error' : ''}`}>
                        <label className="profile-label">Yeni Parola Tekrar</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="profile-input"
                            placeholder="Parolayı tekrar girin"
                            value={form.confirmPassword}
                            onChange={e => setField('confirmPassword', e.target.value)}
                        />
                        {errors.confirmPassword && <p className="profile-error-msg">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        className="profile-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Profile;