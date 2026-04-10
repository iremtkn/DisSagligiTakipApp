'use client';
import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/layout/context/AuthContext';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5259';

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({
        firstName:       '',
        lastName:        '',
        email:           '',
        birthDate:       null as Date | null,
        newPassword:     '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus]   = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        axios.get(`${API_BASE}/api/profile/${user.id}`)
            .then((res) => {
                const d = res.data;
                setForm(f => ({
                    ...f,
                    firstName: d.firstName || '',
                    lastName:  d.lastName  || '',
                    email:     d.email     || '',
                    birthDate: d.birthDate ? new Date(d.birthDate) : null
                }));
            })
            .catch(() => setStatus({ type: 'error', msg: 'Veriler yüklenemedi.' }))
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async () => {
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setStatus({ type: 'error', msg: t('passwords_not_match') });
            return;
        }
        if (!user?.id) return;

        setLoading(true);
        setStatus({ type: null, msg: '' });

        try {
            const res = await axios.put(`${API_BASE}/api/profile/update`, {
                userId:      user.id,
                firstName:   form.firstName,
                lastName:    form.lastName,
                email:       form.email,
                birthDate:   form.birthDate ?? new Date(),
                newPassword: form.newPassword || null
            });

            updateUser({
                firstName: res.data.user.firstName,
                lastName:  res.data.user.lastName,
                email:     res.data.user.email
            });

            setStatus({ type: 'success', msg: t('profile_updated') });
            setForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));

        } catch (err: any) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-content-center">
            <div className="col-12 lg:col-10 xl:col-8">
                <div className="card border-none shadow-1 p-4 md:p-6" style={{ borderRadius: '16px', background: 'var(--surface-card)' }}>
                    <div className="mx-auto" style={{ maxWidth: '700px' }}>

                        <div className="flex align-items-center mb-5 gap-4">
                            <div className="bg-blue-50 border-circle flex align-items-center justify-content-center"
                                style={{ width: '50px', height: '50px' }}>
                                <i className="pi pi-user text-2xl text-blue-600"></i>
                            </div>
                            <div>
                                <h2 className="text-900 font-semibold m-0 line-height-2">{t('profile_title')}</h2>
                                <p className="text-500 m-0">{t('profile_subtitle')}</p>
                            </div>
                        </div>

                        {status.type && (
                            <div className="mb-4">
                                <Message severity={status.type} text={status.msg} className="w-full justify-content-start" />
                            </div>
                        )}

                        <div className="p-fluid">
                            <div className="formgrid grid">
                                
                                <div className="field col-12 md:col-6 mb-3">
                                    <label className="text-800 font-medium mb-2 block">{t('name')}</label>
                                    <InputText
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        placeholder="Adınız"
                                    />
                                </div>

                                <div className="field col-12 md:col-6 mb-3">
                                    <label className="text-800 font-medium mb-2 block">{t('surname')}</label>
                                    <InputText
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        placeholder="Soyadınız"
                                    />
                                </div>

                                <div className="field col-12 mb-3">
                                    <label className="text-800 font-medium mb-2 block">{t('email')}</label>
                                    <InputText
                                        className="surface-100 border-none font-medium"
                                        value={form.email}
                                        disabled
                                    />
                                    <small className="text-500 mt-1 block">E-posta adresi değiştirilemez.</small>
                                </div>

                                <div className="field col-12 mb-4">
                                    <label className="text-800 font-medium mb-2 block">{t('birth_date')}</label>
                                    <Calendar
                                        value={form.birthDate}
                                        onChange={(e) => setForm({ ...form, birthDate: e.value as Date })}
                                        showIcon
                                        dateFormat="dd/mm/yy"
                                        maxDate={new Date()}
                                        placeholder="GG/AA/YYYY"
                                    />
                                </div>

                                <div className="col-12 mt-2 mb-4">
                                    <div className="flex align-items-center gap-2 mb-3">
                                        <i className="pi pi-lock text-700"></i>
                                        <h4 className="text-900 font-semibold m-0">{t('change_password_title')}</h4>
                                    </div>
                                    <div className="surface-border border-top-1 w-full"></div>
                                </div>

                                <div className="field col-12 md:col-6 mb-3">
                                    <label className="text-800 font-medium mb-2 block">{t('new_password')}</label>
                                    <Password
                                        toggleMask
                                        value={form.newPassword}
                                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        inputClassName="w-full"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="field col-12 md:col-6 mb-3">
                                    <label className="text-800 font-medium mb-2 block">{t('new_confirm_password')}</label>
                                    <Password
                                        toggleMask
                                        feedback={false}
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        inputClassName="w-full"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className="col-12 flex justify-content-end mt-4">
                                    <Button
                                        label={t('save_changes')}
                                        icon="pi pi-check"
                                        loading={loading}
                                        onClick={handleSave}
                                        className="p-button-primary px-5 py-3 font-semibold"
                                        style={{ borderRadius: '8px', width: 'auto' }}
                                    />
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