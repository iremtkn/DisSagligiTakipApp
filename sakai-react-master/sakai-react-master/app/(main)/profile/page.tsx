'use client';
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ProfilePage = () => {
    const { t } = useTranslation();
    const API = 'http://localhost:5259/api';
    
    const [form, setForm] = useState({
        name: '',
        surname: '',
        email: '',
        birthDate: null as Date | null,
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData?.id;

        if (userId) {
            axios.get(`${API}/profile/${userId}`)
                .then((res: any) => {
                    const data = res.data;
                    setForm(f => ({
                        ...f,
                        name: data.name || '',
                        surname: data.surname || '',
                        email: data.email || '',
                        birthDate: data.birthDate ? new Date(data.birthDate) : null
                    }));
                })
                .catch(() => setStatus({ type: 'error', msg: 'Veriler yüklenemedi.' }));
        }
    }, []);

    const handleSave = async () => {
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setStatus({ type: 'error', msg: t('passwords_not_match') });
            return;
        }

        setLoading(true);
        setStatus({ type: null, msg: '' });

        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await axios.put(`${API}/profile/update`, {
                userId: userData.id,
                name: form.name,
                surname: form.surname,
                email: form.email,
                birthDate: form.birthDate,
                newPassword: form.newPassword || null
            });

            localStorage.setItem('user', JSON.stringify({ ...userData, ...res.data.user }));
            setStatus({ type: 'success', msg: t('profile_updated') });
            setForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card shadow-1 p-5"> 
                    
                    <div className="mx-auto" style={{ maxWidth: '850px' }}> 
                        
                        <div className="flex align-items-center mb-5 gap-3 border-bottom-1 surface-border pb-3">
                            <div className="bg-primary-100 border-circle flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                <i className="pi pi-user text-3xl text-primary-600"></i>
                            </div>
                            <div>
                                <h3 className="text-900 font-medium m-0">{t('profile_title')}</h3>
                                <span className="text-600 text-sm">{t('profile_subtitle')}</span>
                            </div>
                        </div>

                        {status.type && <Message severity={status.type} text={status.msg} className="w-full mb-5" />}

                        <div className="p-fluid">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 mb-4">
                                    <label className="font-semibold mb-2 block">{t('name')}</label>
                                    <InputText className="p-inputtext-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="field col-12 md:col-6 mb-4">
                                    <label className="font-semibold mb-2 block">{t('surname')}</label>
                                    <InputText className="p-inputtext-lg" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
                                </div>
                                <div className="field col-12 mb-4">
                                    <label className="font-semibold mb-2 block">{t('email')}</label>
                                    <InputText className="p-inputtext-lg opacity-60" value={form.email} disabled />
                                </div>
                                <div className="field col-12 mb-4">
                                    <label className="font-semibold mb-2 block">{t('birth_date')}</label>
                                    <Calendar className="p-inputtext-lg" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.value as Date })} showIcon />
                                </div>

                                <div className="col-12 py-3">
                                    <div className="surface-border border-top-1 opacity-50"></div>
                                </div>

                                <div className="col-12 mb-4">
                                    <h4 className="text-900 font-medium m-0">{t('change_password_title')}</h4>
                                    <p className="text-500 text-sm m-0">{t('password_hint')}</p>
                                </div>

                                <div className="field col-12 md:col-6 mb-4">
                                    <label className="font-semibold mb-2 block">{t('new_password')}</label>
                                    <Password className="w-full" inputClassName="p-inputtext-lg w-full" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} toggleMask />
                                </div>
                                <div className="field col-12 md:col-6 mb-4">
                                    <label className="font-semibold mb-2 block">{t('new_confirm_password')}</label>
                                    <Password className="w-full" inputClassName="p-inputtext-lg w-full" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} toggleMask feedback={false} />
                                </div>

                                <div className="col-12 flex justify-content-end mt-5">
                                    <Button label={t('save_changes')} icon="pi pi-save" loading={loading} onClick={handleSave} className="p-button-lg px-6 w-auto shadow-2" style={{ borderRadius: '12px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;