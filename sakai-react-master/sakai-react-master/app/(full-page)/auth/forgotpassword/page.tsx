'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '@/layout/i18n';

const API = 'http://localhost:5259/api';

const ForgotPasswordPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isUserFound, setIsUserFound] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({ newPassword: '', confirmPassword: '' });
    const [successMessage, setSuccessMessage] = useState('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const getLocalCriteria = useCallback(() => {
        const criteria: any = {
            tr: ["En az 8 karakter", "Büyük harf", "Küçük harf", "Rakam"],
            en: ["Min 8 characters", "Uppercase", "Lowercase", "Number"],
            de: ["Mind. 8 Zeichen", "Großbuchstabe", "Kleinbuchstabe", "Zahl"]
        };
        const lang = i18n.language.split('-')[0] || 'tr';
        return criteria[lang] || criteria['tr'];
    }, [i18n.language]);

    const validatePasswordField = (field: string, value: string) => {
        if (field === 'newPassword') {
            if (!value || !passwordRegex.test(value)) {
                setPasswordErrors(prev => ({ ...prev, newPassword: t('password_hint') || 'Geçersiz format' }));
                return false;
            }
            setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
            return true;
        }
        if (field === 'confirmPassword') {
            if (value !== passwords.newPassword) {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: t('passwords_not_match') }));
                return false;
            }
            setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
            return true;
        }
        return true;
    };

    const handleVerifyEmail = async () => {
        if (!email.trim()) {
            setEmailError(t('placeholder_email_forgot'));
            return;
        }
        setIsVerifying(true);
        try {
            const response = await axios.get(`${API}/auth/check-user?email=${encodeURIComponent(email.trim())}`);
            if (response.data.exists) {
                setIsUserFound(true);
                setEmailError('');
            } else {
                setEmailError(t('user_not_found') || 'Kullanıcı bulunamadı');
            }
        } catch (error) {
            setEmailError(t('server_error'));
        } finally {
            setIsVerifying(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!validatePasswordField('newPassword', passwords.newPassword) || !validatePasswordField('confirmPassword', passwords.confirmPassword)) return;
        setIsUpdating(true);
        try {
            await axios.post(`${API}/auth/reset-password`, { email: email.trim(), newPassword: passwords.newPassword });
            setSuccessMessage(t('profile_updated'));
            setTimeout(() => router.push('/auth/login'), 2500);
        } catch (error) {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: t('server_error') }));
        } finally {
            setIsUpdating(false);
        }
    };

    const criteriaTexts = getLocalCriteria();

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden p-4">
            <div className="flex flex-column align-items-center justify-content-center w-full" style={{ maxWidth: '560px' }}>
                
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }} className="w-full shadow-6 fadeinanimation">
                    <div className="surface-card py-7 px-5 sm:px-7" style={{ borderRadius: '53px' }}>
                        
                        <div className="flex justify-content-center gap-2 mb-4">
                            <button onClick={() => i18n.changeLanguage('tr')} className={`p-link ${i18n.language === 'tr' ? 'font-bold text-primary' : 'text-600'}`}>TR</button>
                            <span className="text-400">|</span>
                            <button onClick={() => i18n.changeLanguage('en')} className={`p-link ${i18n.language === 'en' ? 'font-bold text-primary' : 'text-600'}`}>EN</button>
                            <span className="text-400">|</span>
                            <button onClick={() => i18n.changeLanguage('de')} className={`p-link ${i18n.language === 'de' ? 'font-bold text-primary' : 'text-600'}`}>DE</button>
                        </div>

                        <div className="text-center mb-5">
                            <i className={`pi ${isUserFound ? 'pi-lock-open' : 'pi-question-circle'} text-primary text-5xl mb-3`}></i>
                            <div className="text-900 text-3xl font-medium mb-3 line-height-2">{t('forgot_password_title')}</div>
                            <span className="text-600 font-medium line-height-3 block px-2">
                                {isUserFound ? (i18n.language === 'tr' ? 'Yeni parolanızı aşağıya giriniz.' : 'Enter your new password below.') : t('forgot_password_subtitle')}
                            </span>
                        </div>

                        <div className="p-fluid">
                            <div className="field mb-4">
                                <label className="block text-900 text-xl font-medium mb-2">{t('email')}</label>
                                <div className="p-inputgroup">
                                    <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@gmail.com" disabled={isUserFound} className={emailError ? 'p-invalid' : ''} />
                                    {isUserFound && <span className="p-inputgroup-addon bg-green-100"><i className="pi pi-check text-green-600"></i></span>}
                                </div>
                                {emailError && <small className="p-error block mt-1">! {emailError}</small>}
                            </div>

                            {!isUserFound && (
                                <Button label={t('send_button') || 'Doğrula'} icon="pi pi-search" className="w-full p-3 text-xl mb-4 p-button-raised shadow-2" loading={isVerifying} onClick={handleVerifyEmail}></Button>
                            )}

                            {isUserFound && !successMessage && (
                                <div className="animation-duration-400 fadein mt-4">
                                    <div className="field mb-3">
                                        <label className="block text-900 font-medium mb-2 uppercase text-xs font-bold">{t('new_password')}</label>
                                        <InputText type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className={`p-3 ${passwordErrors.newPassword ? 'p-invalid' : ''}`} />
                                    </div>
                                    <div className="field mb-4">
                                        <label className="block text-900 font-medium mb-2 uppercase text-xs font-bold">{t('new_confirm_password')}</label>
                                        <InputText type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className={`p-3 ${passwordErrors.confirmPassword ? 'p-invalid' : ''}`} />
                                        {passwordErrors.confirmPassword && <small className="p-error block mt-1">! {passwordErrors.confirmPassword}</small>}
                                    </div>

                                    <ul className="list-none p-3 m-0 mb-4 surface-100 border-round-xl text-xs border-1 surface-border grid grid-cols-1 gap-2">
                                        <li className={passwords.newPassword.length >= 8 ? 'text-green-600 font-bold' : 'text-500'}>
                                            {passwords.newPassword.length >= 8 ? '●' : '○'} {criteriaTexts[0]}
                                        </li>
                                        <li className={/[A-Z]/.test(passwords.newPassword) ? 'text-green-600 font-bold' : 'text-500'}>
                                            {/[A-Z]/.test(passwords.newPassword) ? '●' : '○'} {criteriaTexts[1]}
                                        </li>
                                        <li className={/[a-z]/.test(passwords.newPassword) ? 'text-green-600 font-bold' : 'text-500'}>
                                            {/[a-z]/.test(passwords.newPassword) ? '●' : '○'} {criteriaTexts[2]}
                                        </li>
                                        <li className={/\d/.test(passwords.newPassword) ? 'text-green-600 font-bold' : 'text-500'}>
                                            {/\d/.test(passwords.newPassword) ? '●' : '○'} {criteriaTexts[3]}
                                        </li>
                                    </ul>

                                    <Button label={t('save_changes')} icon="pi pi-save" className="w-full p-3 text-xl p-button-success p-button-raised shadow-3" loading={isUpdating} onClick={handleUpdatePassword}></Button>
                                </div>
                            )}

                            {successMessage && (
                                <div className="text-center p-4 bg-green-50 border-round-2xl border-1 border-green-200 animation-flipright">
                                    <i className="pi pi-check-circle text-green-500 text-4xl mb-2"></i>
                                    <p className="text-green-800 font-medium m-0">{successMessage}</p>
                                </div>
                            )}

                            <div className="text-center mt-5">
                                <a onClick={() => router.push('/auth/login')} className="cursor-pointer text-primary font-bold no-underline hover:underline transition-colors text-sm">
                                    ← {t('back_to_login')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;