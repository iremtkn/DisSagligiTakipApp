import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isUserFound, setIsUserFound] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({ newPassword: '', confirmPassword: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const validateEmail = (value) => {
        if (!value.trim()) {
            setEmailError('Lütfen e-posta adresinizi giriniz.');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePasswordField = (field, value) => {
        if (field === 'newPassword') {
            if (!value) {
                setPasswordErrors(prev => ({ ...prev, newPassword: 'Yeni parola boş bırakılamaz.' }));
                return false;
            }
            if (!passwordRegex.test(value)) {
                setPasswordErrors(prev => ({
                    ...prev,
                    newPassword: 'En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.'
                }));
                return false;
            }
            setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
            return true;
        }

        if (field === 'confirmPassword') {
            if (!value) {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Parola tekrarı boş bırakılamaz.' }));
                return false;
            }
            if (value !== passwords.newPassword) {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Parolalar uyuşmuyor.' }));
                return false;
            }
            setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
            return true;
        }
    };

    const handleVerifyEmail = async () => {
        if (!validateEmail(email)) return;

        setIsVerifying(true);
        try {
            const response = await axios.get(
                `http://localhost:5259/api/auth/check-user?email=${encodeURIComponent(email.trim())}`
            );

            if (response.data.exists) {
                setIsUserFound(true);
                setEmailError('');
            } else {
                setEmailError('Bu e-posta adresine ait kullanıcı bilgisi bulunamadı.');
                setIsUserFound(false);
            }
        } catch (error) {
            setEmailError('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.');
            setIsUserFound(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleUpdatePassword = async () => {
        const isNewPasswordValid = validatePasswordField('newPassword', passwords.newPassword);
        const isConfirmValid = validatePasswordField('confirmPassword', passwords.confirmPassword);

        if (!isNewPasswordValid || !isConfirmValid) return;

        setIsUpdating(true);
        try {
            await axios.post('http://localhost:5259/api/auth/reset-password', {
                email: email.trim(),
                newPassword: passwords.newPassword
            });
            setSuccessMessage('Parolanız başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            setPasswordErrors(prev => ({
                ...prev,
                confirmPassword: 'Parola güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
            }));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === 'Enter') handleVerifyEmail();
    };

    return (
        <div className="fp-page">
            <div className="fp-card">
                <div className="fp-icon">🔑</div>
                <h2 className="fp-title">Parola Hatırlatma</h2>
                <p className="fp-subtitle">
                    {isUserFound
                        ? 'Yeni parolanızı aşağıya giriniz.'
                        : 'Kayıtlı e-posta adresinizi girerek parolanızı sıfırlayın.'}
                </p>

                {}
                <div className={`fp-field ${emailError ? 'has-error' : ''} ${isUserFound ? 'is-verified' : ''}`}>
                    <label className="fp-label">E-posta Adresi</label>
                    <div className="fp-input-row">
                        <input
                            type="email"
                            className="fp-input"
                            placeholder="ornek@gmail.com"
                            value={email}
                            disabled={isUserFound}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) validateEmail(e.target.value);
                            }}
                            onKeyDown={handleEmailKeyDown}
                        />
                        {isUserFound && <span className="fp-check">✓</span>}
                    </div>
                    {emailError && <p className="fp-error-msg">{emailError}</p>}

                    {!isUserFound && (
                        <button
                            className="fp-btn fp-btn-verify"
                            onClick={handleVerifyEmail}
                            disabled={isVerifying}
                        >
                            {isVerifying ? (
                                <span className="fp-spinner" />
                            ) : (
                                'Doğrula'
                            )}
                        </button>
                    )}
                </div>

                {}
                {isUserFound && !successMessage && (
                    <div className="fp-passwords">
                        <div className={`fp-field ${passwordErrors.newPassword ? 'has-error' : ''}`}>
                            <label className="fp-label">Yeni Parola</label>
                            <input
                                type="password"
                                className="fp-input"
                                placeholder="Yeni parolanız"
                                value={passwords.newPassword}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, newPassword: e.target.value });
                                    if (passwordErrors.newPassword)
                                        validatePasswordField('newPassword', e.target.value);
                                }}
                            />
                            {passwordErrors.newPassword && (
                                <p className="fp-error-msg">{passwordErrors.newPassword}</p>
                            )}
                        </div>

                        <div className={`fp-field ${passwordErrors.confirmPassword ? 'has-error' : ''}`}>
                            <label className="fp-label">Yeni Parola Tekrar</label>
                            <input
                                type="password"
                                className="fp-input"
                                placeholder="Parolanızı tekrar girin"
                                value={passwords.confirmPassword}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, confirmPassword: e.target.value });
                                    if (passwordErrors.confirmPassword)
                                        validatePasswordField('confirmPassword', e.target.value);
                                }}
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="fp-error-msg">{passwordErrors.confirmPassword}</p>
                            )}
                        </div>

                        <ul className="fp-criteria">
                            <li className={passwords.newPassword.length >= 8 ? 'met' : ''}>En az 8 karakter</li>
                            <li className={/[A-Z]/.test(passwords.newPassword) ? 'met' : ''}>En az bir büyük harf</li>
                            <li className={/[a-z]/.test(passwords.newPassword) ? 'met' : ''}>En az bir küçük harf</li>
                            <li className={/\d/.test(passwords.newPassword) ? 'met' : ''}>En az bir rakam</li>
                        </ul>

                        <button
                            className="fp-btn fp-btn-update"
                            onClick={handleUpdatePassword}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <span className="fp-spinner" /> : 'Parolayı Güncelle'}
                        </button>
                    </div>
                )}

                {}
                {successMessage && (
                    <div className="fp-success">
                        <span className="fp-success-icon">✓</span>
                        <p>{successMessage}</p>
                    </div>
                )}

                <p className="fp-back" onClick={() => navigate('/login')}>
                    ← Giriş Sayfasına Dön
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
