/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useTranslation } from 'react-i18next';
import '@/layout/i18n';

const RegisterPage = () => {
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState<any>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    
    const router = useRouter();

    const onRegister = async () => {
        if (password !== confirmPassword) {
            alert("Şifreler uyuşmuyor!");
            return;
        }

        try {
            console.log("ElasticSearch'e log gönderiliyor: Yeni Kayıt Denemesi - ", email);
            alert("Kayıt işlemi simüle edildi ve ElasticSearch'e loglandı!");
            router.push('/auth/login');
            
        } catch (error) {
            console.error("Loglama hatası:", error);
        }
    };

    return (
        <div className="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
            <div className="flex flex-column align-items-center justify-content-center">
                <img src="/layout/images/logo-dark.svg" alt="Logo" className="mb-5 w-6rem flex-shrink-0" />

                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-5 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                
                         <div className="flex justify-content-center gap-2 mb-4">
                          <button onClick={() => i18n.changeLanguage('tr')} className={`p-link ${i18n.language === 'tr' ? 'font-bold text-primary' : 'text-600'}`}>TR</button>
                            <span className="text-400">|</span>
                          <button onClick={() => i18n.changeLanguage('en')} className={`p-link ${i18n.language === 'en' ? 'font-bold text-primary' : 'text-600'}`}>EN</button>
                           <span className="text-400">|</span>
                           <button onClick={() => i18n.changeLanguage('de')} className={`p-link ${i18n.language === 'de' ? 'font-bold text-primary' : 'text-600'}`}>DE</button>
                        </div>

                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">{t('register_title')}</div>
                            <span className="text-600 font-medium">{t('register_subtitle')}</span>
                        </div>

                        <div className="w-full md:w-30rem">
                            <div className="flex gap-3 mb-3">
                                <div className="flex-1">
                                    <label className="block text-900 text-lg font-medium mb-2">{t('name')}</label>
                                    <InputText value={name} onChange={(e) => setName(e.target.value)} placeholder={t('placeholder_name')} className="w-full" style={{ padding: '0.75rem' }} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-900 text-lg font-medium mb-2">{t('surname')}</label>
                                    <InputText value={surname} onChange={(e) => setSurname(e.target.value)} placeholder={t('placeholder_surname')} className="w-full" style={{ padding: '0.75rem' }} />
                                </div>
                            </div>

                            <label className="block text-900 text-lg font-medium mb-2">{t('email')}</label>
                            <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('placeholder_email')} className="w-full mb-3" style={{ padding: '0.75rem' }} />

                            <label className="block text-900 text-lg font-medium mb-2">{t('birth_date')}</label>
                            <Calendar value={birthDate} onChange={(e) => setBirthDate(e.value)} showIcon placeholder={t('placeholder_date')} className="w-full mb-3" inputStyle={{ padding: '0.75rem' }} />

                            <label className="block text-900 font-medium text-lg mb-2">{t('password')}</label>
                            <Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('placeholder_password')} toggleMask className="w-full mb-3" inputClassName="w-full p-3 md:w-30rem" feedback={false}></Password>

                            <label className="block text-900 font-medium text-lg mb-2">{t('password_confirm')}</label>
                            <Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('placeholder_confirm')} toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" feedback={false}></Password>

                            <Button label={t('register_button')} className="w-full p-3 text-xl" onClick={onRegister}></Button>
                            
                            <div className="text-center mt-4">
                             <span className="text-600 font-medium">{t('already_have_account_text')}</span>
                             <a onClick={() => router.push('/auth/login')} className="cursor-pointer text-primary font-medium no-underline ml-2">
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