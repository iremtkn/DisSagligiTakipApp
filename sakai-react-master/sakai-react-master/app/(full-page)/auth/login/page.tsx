/* eslint-disable @next/next/no-img-element */
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

const LoginPage = () => {
    const { t, i18n } = useTranslation();
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();

    const onLogin = async () => {
        console.log("Giriş deneniyor:", email);
        router.push('/');
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="flex justify-content-center gap-2 mb-4">
                          <button onClick={() => i18n.changeLanguage('tr')} className={`p-link ${i18n.language === 'tr' ? 'font-bold text-primary' : 'text-600'}`}>TR</button>
                            <span className="text-400">|</span>
                          <button onClick={() => i18n.changeLanguage('en')} className={`p-link ${i18n.language === 'en' ? 'font-bold text-primary' : 'text-600'}`}>EN</button>
                            <span className="text-400">|</span>
                          <button onClick={() => i18n.changeLanguage('de')} className={`p-link ${i18n.language === 'de' ? 'font-bold text-primary' : 'text-600'}`}>DE</button>                        
                        </div>

                        <div className="text-center mb-5">
                            <i className="pi pi-user-plus text-primary text-5xl mb-3"></i>
                            <div className="text-900 text-2xl font-bold mb-3 px-4 mx-auto" style={{ maxWidth: '350px', lineHeight: '1.2' }}>{t('login_welcome_title')}</div>
                            <span className="text-600 font-medium">{t('login_welcome_subtitle')}</span>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-medium mb-2">
                                {t('email')}
                            </label>
                            <InputText 
                                id="email1" 
                                type="text" 
                                placeholder={t('placeholder_email')} 
                                className="w-full md:w-30rem mb-5" 
                                style={{ padding: '1rem' }} 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                {t('password')}
                            </label>
                            <Password 
                                inputId="password1" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder={t('placeholder_password')} 
                                toggleMask 
                                className="w-full mb-5" 
                                inputClassName="w-full p-3 md:w-30rem"
                            ></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">{t('remember_me')}</label>
                                </div>
                                <a onClick={() => router.push('/auth/forgotpassword')} className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                  {t('forgot_password')}
                                </a>
                            </div>

                            <Button label={t('login_button_text')} className="w-full p-3 text-xl" onClick={onLogin}></Button>
                            
                            <div className="text-center mt-4">
                                <span className="text-600 font-medium">{t('no_account_text')}</span>
                                <a onClick={() => router.push('/auth/register')} className="cursor-pointer text-primary font-bold no-underline ml-2 hover:underline">
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