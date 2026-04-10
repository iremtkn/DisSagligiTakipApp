'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Calendar } from 'primereact/calendar';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { useTranslation } from 'react-i18next';
import '@/layout/i18n';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5259';

const RegisterPage = () => {
    const { t, i18n } = useTranslation();
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();

    const [firstName, setFirstName]             = useState('');
    const [lastName, setLastName]               = useState('');
    const [email, setEmail]                     = useState('');
    const [birthDate, setBirthDate]             = useState<Date | null>(null);
    const [password, setPassword]               = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg]               = useState('');
    const [successMsg, setSuccessMsg]           = useState('');
    const [loading, setLoading]                 = useState(false);

    const onRegister = async () => {
        if (!firstName || !lastName || !email || !birthDate || !password || !confirmPassword) {
            setErrorMsg('Lütfen tüm alanları doldurun.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg(t('passwords_not_match'));
            return;
        }
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await axios.post(`${API_BASE}/api/Auth/register`, {
                firstName,
                lastName,
                email,
                birthDate: birthDate.toISOString(),
                password
            });
            setSuccessMsg(res.data.message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
            setTimeout(() => router.push('/auth/login'), 2000);
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Kayıt sırasında hata oluştu.');
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
            <div className="flex flex-column align-items-center justify-content-center py-4 w-full px-3">
                
                <div className="flex align-items-center justify-content-center bg-primary border-circle mb-4 shadow-2" style={{ width: '80px', height: '80px' }}>
                    <i className="pi pi-shield text-white" style={{ fontSize: '3rem' }}></i>
                </div>

                <div style={{
                    borderRadius: '56px',
                    padding: '0.3rem',
                    background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)',
                    width: '100%',
                    maxWidth: '520px'
                }}>
                    <div className="w-full surface-card py-5 px-4 sm:px-6" style={{ borderRadius: '53px' }}>

                        <div className="flex justify-content-center gap-2 mb-3">
                            <button onClick={() => i18n.changeLanguage('tr')} className={`p-link ${i18n.language === 'tr' ? 'font-bold text-primary' : 'text-600'}`}>TR</button>
                            <span className="text-400">|</span>
                            <button onClick={() => i18n.changeLanguage('en')} className={`p-link ${i18n.language === 'en' ? 'font-bold text-primary' : 'text-600'}`}>EN</button>
                            <span className="text-400">|</span>
                            <button onClick={() => i18n.changeLanguage('de')} className={`p-link ${i18n.language === 'de' ? 'font-bold text-primary' : 'text-600'}`}>DE</button>
                        </div>

                        <div className="text-center mb-4">
                            <i className="pi pi-user-plus text-primary text-4xl mb-2"></i>
                            <div className="text-900 text-xl font-bold mb-2">{t('register_title')}</div>
                            <span className="text-600 font-medium text-sm">{t('register_subtitle')}</span>
                        </div>

                        <div className="flex flex-column">
                            <label className="block text-900 text-sm font-medium mb-1">{t('name')}</label>
                            <InputText
                                placeholder={t('placeholder_name')}
                                className="w-full mb-3"
                                style={{ padding: '0.75rem' }}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />

                            <label className="block text-900 text-sm font-medium mb-1">{t('surname')}</label>
                            <InputText
                                placeholder={t('placeholder_surname')}
                                className="w-full mb-3"
                                style={{ padding: '0.75rem' }}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />

                            <label className="block text-900 text-sm font-medium mb-1">{t('email')}</label>
                            <InputText
                                type="email"
                                placeholder={t('placeholder_email')}
                                className="w-full mb-3"
                                style={{ padding: '0.75rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label className="block text-900 text-sm font-medium mb-1">{t('birth_date')}</label>
                            <Calendar
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.value as Date)}
                                placeholder={t('placeholder_date')}
                                className="w-full mb-3"
                                inputStyle={{ padding: '0.75rem' }}
                                inputClassName="w-full"
                                dateFormat="dd/mm/yy"
                                showIcon
                                maxDate={new Date()}
                            />

                            <label className="block text-900 font-medium text-sm mb-1">{t('password')}</label>
                            <Password
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('placeholder_password')}
                                toggleMask
                                className="w-full mb-3"
                                inputClassName="w-full p-3"
                                pt={{ root: { style: { width: '100%' } } }}
                            />

                            <label className="block text-900 font-medium text-sm mb-1">{t('password_confirm')}</label>
                            <Password
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('placeholder_confirm')}
                                toggleMask
                                feedback={false}
                                className="w-full mb-3"
                                inputClassName="w-full p-3"
                                pt={{ root: { style: { width: '100%' } } }}
                            />

                            {errorMsg && (
                                <div className="p-2 mb-3 border-round bg-red-50 border-1 border-red-300">
                                    <span className="text-red-600 text-xs">
                                        <i className="pi pi-exclamation-circle mr-2" />{errorMsg}
                                    </span>
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-2 mb-3 border-round bg-green-50 border-1 border-green-300">
                                    <span className="text-green-600 text-xs">
                                        <i className="pi pi-check-circle mr-2" />{successMsg}
                                    </span>
                                </div>
                            )}

                            <Button
                                label={loading ? 'Kaydediliyor...' : t('register_button')}
                                className="w-full p-3 text-lg mt-1"
                                onClick={onRegister}
                                disabled={loading}
                                icon={loading ? 'pi pi-spin pi-spinner' : undefined}
                            />

                            <div className="text-center mt-3">
                                <span className="text-600 font-medium text-sm">{t('already_have_account_text')}</span>
                                <a
                                    onClick={() => router.push('/auth/login')}
                                    className="cursor-pointer text-primary font-bold no-underline ml-2 hover:underline text-sm"
                                >
                                    {t('login_link_text')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;