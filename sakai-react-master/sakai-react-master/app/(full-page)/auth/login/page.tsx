'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useTranslation } from 'react-i18next';
import '@/layout/i18n';
import { useAuth } from '@/layout/context/AuthContext';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5259';

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [checked, setChecked] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const { login } = useAuth();
    const router = useRouter();

    const onLogin = async () => {
        if (!email || !password) {
            setErrorMsg(t('fill_all_fields') || 'Lütfen tüm alanları doldurun.');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.post(`${API_BASE}/api/Auth/login`, { email, password });
            if (res.data.success) {
                login(res.data.user);
                router.push('/');
            } else {
                setErrorMsg(res.data.message || 'Giriş başarısız.');
            }
        } catch {
            setErrorMsg('Sunucuya bağlanılamadı.');
        } finally {
            setLoading(false);
        }
    };

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center w-full px-3">
                <div className="flex align-items-center justify-content-center bg-primary border-circle mb-5 shadow-2" style={{ width: '80px', height: '80px' }}>
                    <i className="pi pi-shield text-white" style={{ fontSize: '3rem' }}></i>
                </div>

                <div style={{
                    borderRadius: '56px',
                    padding: '0.3rem',
                    background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33,150,243,0) 30%)',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    <div className="w-full surface-card py-6 px-5" style={{ borderRadius: '53px' }}>
                        
                        <div className="flex justify-content-center gap-2 mb-4">
                            {['tr', 'en', 'de'].map((lang, idx, arr) => (
                                <React.Fragment key={lang}>
                                    <button
                                        onClick={() => i18n.changeLanguage(lang)}
                                        className={`p-link ${i18n.language === lang ? 'font-bold text-primary' : 'text-600'}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                    {idx < arr.length - 1 && <span className="text-400">|</span>}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="text-center mb-5">
                            <i className="pi pi-user-plus text-primary text-5xl mb-3 block"></i>
                            <div className="text-900 text-xl font-bold mb-2">
                                {t('login_welcome_title')}
                            </div>
                            <span className="text-600 text-sm">{t('login_welcome_subtitle')}</span>
                        </div>

                        <div className="flex flex-column gap-3">
                            <div>
                                <label htmlFor="email1" className="block text-900 font-medium mb-2">{t('email')}</label>
                                <InputText id="email1" type="email" placeholder={t('placeholder_email')} className="w-full p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div>
                                <label htmlFor="password1" className="block text-900 font-medium mb-2">{t('password')}</label>
                                <Password inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('placeholder_password')} toggleMask feedback={false} className="w-full" inputClassName="w-full p-3" />
                            </div>

                            {errorMsg && (
                                <div className="p-3 border-round bg-red-50 border-1 border-red-300">
                                    <span className="text-red-600 text-sm"><i className="pi pi-exclamation-circle mr-2" />{errorMsg}</span>
                                </div>
                            )}

                            <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="rememberme" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} />
                                    <label htmlFor="rememberme" className="text-sm">{t('remember_me')}</label>
                                </div>
                                <a onClick={() => router.push('/auth/forgotpassword')} className="font-medium no-underline cursor-pointer text-sm text-primary">
                                    {t('forgot_password')}
                                </a>
                            </div>

                            <Button label={loading ? t('loading') : t('login_button_text')} className="w-full p-3 text-lg" onClick={onLogin} disabled={loading} icon={loading ? 'pi pi-spin pi-spinner' : undefined} />

                            <div className="text-center">
                                <span className="text-600 text-sm">{t('no_account_text')}</span>
                                <a onClick={() => router.push('/auth/register')} className="cursor-pointer text-primary font-bold no-underline ml-2 text-sm hover:underline">
                                    {t('register_link_text')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;