'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API = 'http://localhost:5259/api';

const DentalHealthPage = () => {
    const { t, i18n } = useTranslation();
    const [goals, setGoals] = useState<any[]>([]);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [dailyRecords, setDailyRecords] = useState<any[]>([]);
    const [tip, setTip] = useState('');
    const [activityForms, setActivityForms] = useState<any>({});

    const priorityOptions = [
        { label: t('low'), value: 'low' },
        { label: t('medium'), value: 'medium' },
        { label: t('high'), value: 'high' }
    ];

    const getLocalTips = useCallback(() => {
        const tips: any = {
            tr: [
                "Florürlü diş macunu kullanmak diş minesini güçlendirir.",
                "Diş ipi kullanımı diş aralarındaki plakları temizler.",
                "Şekerli gıdalardan sonra ağzınızı çalkalamak asit etkisini azaltır.",
                "Diş fırçanızı her 3 ayda bir değiştirmeyi unutmayın."
            ],
            en: [
                "Using fluoride toothpaste strengthens tooth enamel.",
                "Flossing removes plaque between teeth.",
                "Rinsing your mouth after sugary foods reduces acid effects.",
                "Remember to change your toothbrush every 3 months."
            ],
            de: [
                "Die Verwendung von fluoridhaltiger Zahnpasta stärkt den Zahnschmelz.",
                "Zahnseide entfernt Plaque zwischen den Zähnen.",
                "Das Ausspülen des Mundes nach zuckerhaltigen Speisen reduziert die Säurewirkung.",
                "Vergessen Sie nicht, Ihre Zahnbürste alle 3 Monate zu wechseln."
            ]
        };
        const currentLang = i18n.language.split('-')[0] || 'tr';
        return tips[currentLang] || tips['tr'];
    }, [i18n.language]);

    useEffect(() => {
        const localTips = getLocalTips();
        setTip(localTips[Math.floor(Math.random() * localTips.length)]);
    }, [i18n.language, getLocalTips]);

    const fetchAllData = useCallback(async () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userData?.id;
        if (!userId) return;

        try {
            const [goalsRes, activitiesRes, dailyRes, tipRes] = await Promise.all([
                axios.get(`${API}/goal/user/${userId}`),
                axios.get(`${API}/activity/last7days/${userId}`),
                axios.get(`${API}/dailyrecord/last7days/${userId}`),
                axios.get(`${API}/suggestion/random`)
            ]);

            setGoals(goalsRes.data || []);
            setRecentActivities(activitiesRes.data || []);
            setDailyRecords(dailyRes.data || []);
            
            if (tipRes.data && tipRes.data.text) {
                setTip(tipRes.data.text);
            }

            const forms: any = {};
            (goalsRes.data || []).forEach((g: any) => {
                forms[g.id] = { date: new Date(), duration: '', isApplied: false };
            });
            setActivityForms(forms);
        } catch (err) {
            console.log("Veri çekme hatası.");
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleRefreshTip = () => {
        const localTips = getLocalTips();
        setTip(localTips[Math.floor(Math.random() * localTips.length)]);
    };

    const priorityBodyTemplate = (rowData: any) => {
        const severities: any = { high: 'danger', medium: 'warning', low: 'info' };
        return <Tag value={t(rowData.priority) || rowData.priority} severity={severities[rowData.priority] || 'info'} />;
    };

    const SuggestionBox = () => (
        <div className="mt-4 p-3 bg-primary-50 border-round-xl border-1 surface-border flex align-items-center gap-3 relative shadow-1" style={{ minHeight: '75px' }}>
            <div className="flex align-items-center justify-content-center bg-primary border-round-md text-white shadow-1" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                <i className="pi pi-bookmark-fill text-xl"></i>
            </div>
            <div className="flex flex-column flex-grow-1 pr-5">
                <span className="font-bold text-xs text-primary uppercase mb-1">{t('suggestion_title')}</span>
                <p className="m-0 text-700 text-sm italic line-height-2">{tip}</p>
            </div>
            <Button 
                icon="pi pi-refresh" 
                className="p-button-rounded p-button-text p-button-sm text-primary p-0 absolute" 
                style={{ top: '8px', right: '8px' }}
                onClick={handleRefreshTip} 
            />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card shadow-2 border-round-xl">
                    <div className="flex align-items-center gap-3 mb-5 border-bottom-1 surface-border pb-3">
                        <i className="pi pi-shield text-blue-500 text-4xl"></i>
                        <h2 className="m-0 text-900 font-medium">{t('dental_health_title')}</h2>
                    </div>

                    <TabView>
                        <TabPanel header={t('status_tab')} leftIcon="pi pi-chart-bar mr-2">
                            <div className="grid mt-3">
                                <div className="col-12 lg:col-6 mb-4">
                                    <div className="p-4 surface-card border-round-xl shadow-1 border-1 surface-border h-full">
                                        <h5 className="mb-4 font-bold"><i className="pi pi-home mr-2 text-primary"></i>{t('daily_summary')}</h5>
                                        {dailyRecords.length > 0 ? dailyRecords.map((r, i) => (
                                            <div key={i} className="flex align-items-center justify-content-between p-3 surface-50 border-round-lg mb-2 border-1 surface-border shadow-sm">
                                                <span className="font-bold text-700">{new Date(r.date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                                                <div className="flex gap-2">
                                                    {r.brushCount > 0 && <Tag severity="info" value={`🪥 ${r.brushCount}/3`} rounded />}
                                                    {r.flossed && <Tag severity="success" value="🧵" rounded />}
                                                </div>
                                            </div>
                                        )) : <div className="text-center p-5 text-500 italic">{t('no_data')}</div>}
                                    </div>
                                </div>

                                <div className="col-12 lg:col-6 mb-4">
                                    <div className="p-4 surface-card border-round-xl shadow-1 border-1 surface-border h-full">
                                        <h5 className="mb-4 font-bold"><i className="pi pi-history mr-2 text-primary"></i>{t('recent_activities')}</h5>
                                        {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((a, i) => (
                                            <div key={i} className="flex align-items-center justify-content-between p-3 border-bottom-1 surface-border hover:surface-50 transition-colors">
                                                <div className="flex align-items-center gap-3">
                                                    <i className="pi pi-check-circle text-green-500 text-xl"></i>
                                                    <span className="font-semibold text-800">{a.goalTitle}</span>
                                                </div>
                                                <Tag severity="info" value={a.date} />
                                            </div>
                                        )) : <div className="text-center p-5 text-500 italic">Son 7 günde kayıtlı aktivite bulunmuyor.</div>}
                                    </div>
                                </div>

                                <div className="col-12 mt-4">
                                    <h5 className="mb-4 font-bold text-900 border-left-3 border-blue-500 pl-3">{t('add_activity')}</h5>
                                    <div className="grid">
                                        {goals.map((goal) => (
                                            <div key={goal.id} className="col-12 md:col-6 lg:col-4 p-2">
                                                <div className="p-4 surface-card border-round-xl border-1 surface-border shadow-1 hover:shadow-4 transition-all h-full">
                                                    <div className="flex justify-content-between align-items-center mb-4">
                                                        <span className="font-bold text-lg">{goal.title}</span>
                                                        <Tag value={t(goal.priority)} severity={goal.priority === 'high' ? 'danger' : 'warning'} />
                                                    </div>
                                                    <div className="p-fluid">
                                                        <Calendar value={activityForms[goal.id]?.date} className="p-inputtext-sm mb-3" showIcon placeholder={t('date')} />
                                                        <div className="flex gap-2 align-items-center mb-4">
                                                            <InputText placeholder={t('duration_min')} type="number" className="p-inputtext-sm" />
                                                            <div className="flex align-items-center gap-2 ml-auto">
                                                                <Checkbox inputId={`c-${goal.id}`} checked={activityForms[goal.id]?.isApplied} />
                                                                <label htmlFor={`c-${goal.id}`} className="text-sm font-medium">{t('applied')}</label>
                                                            </div>
                                                        </div>
                                                        <Button label={t('save')} icon="pi pi-check" className="p-button-raised shadow-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-12 mt-5">
                                    <div className="p-4 surface-50 border-round-2xl border-1 surface-border shadow-1">
                                        <h5 className="mb-4 font-bold"><i className="pi pi-pencil mr-2 text-primary"></i>{t('add_note')}</h5>
                                        <div className="grid p-fluid align-items-center">
                                            <div className="col-12 md:col-8">
                                                <InputTextarea placeholder="..." rows={3} autoResize className="border-round-xl" />
                                            </div>
                                            <div className="col-12 md:col-4 flex flex-column gap-2">
                                                <span className='text-500 text-xs font-bold uppercase'>{t('upload_label')}</span>
                                                <FileUpload mode="basic" name="demo[]" accept="image/*" chooseLabel={t('upload_image') || 'Dosya Seç'} className="w-full" />
                                                <Button label={t('save')} icon="pi pi-save" className="p-button-primary shadow-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <SuggestionBox />
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel header={t('goals_tab')} leftIcon="pi pi-target mr-2">
                            <div className="grid mt-3">
                                <div className="col-12 lg:col-4 p-3">
                                    <div className="p-4 surface-card border-round-xl shadow-2 border-1 surface-border h-full">
                                        <h5 className="mb-4 font-bold text-blue-600">{t('new_goal_title')}</h5>
                                        <div className="p-fluid">
                                            <div className="field mb-3"><label className="font-bold">{t('goal_title')} *</label><InputText placeholder="..." /></div>
                                            <div className="field mb-3"><label className="font-bold">{t('period')} *</label><InputText placeholder="..." /></div>
                                            <div className="field mb-4"><label className="font-bold">{t('priority')}</label><Dropdown options={priorityOptions} placeholder="..." /></div>
                                            <Button label={t('save')} icon="pi pi-plus-circle" className="p-button-lg shadow-2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 lg:col-8 p-3">
                                    <div className="surface-card border-round-xl shadow-2 border-1 surface-border overflow-hidden h-full">
                                        <DataTable value={goals} paginator rows={5} className="p-datatable-sm" emptyMessage={t('no_goals')}>
                                            <Column field="title" header={t('goal_title')} sortable className="font-bold"></Column>
                                            <Column field="period" header={t('period')}></Column>
                                            <Column field="priority" header={t('priority')} body={priorityBodyTemplate} sortable></Column>
                                            <Column header={t('actions')} body={() => <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />}></Column>
                                        </DataTable>
                                    </div>
                                </div>
                                <div className="col-12 mt-4">
                                    <SuggestionBox />
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};

export default DentalHealthPage;