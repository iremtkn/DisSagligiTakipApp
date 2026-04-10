'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/layout/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DentalService } from '../../../demo/service/DentalService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5259';

interface Note { id: number; note: string; date: string; imageUrl?: string; }
interface Goal { id: number; title: string; description: string; period: string; priority: string; userId: number; }
interface Activity { id: number; date: string; time: string; goalTitle: string; period?: string; isApplied: boolean; }

const DentalHealthPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [dailyRecords, setDailyRecords] = useState<any[]>([]);
    const [goals, setGoals]               = useState<Goal[]>([]);
    const [notes, setNotes]               = useState<Note[]>([]);

    const activities = useMemo(() => {
        return goals.map((g: Goal) => ({
            id: g.id,
            date: t('active_goal'), 
            time: '',
            goalTitle: g.title,
            period: g.period,
            isApplied: true
        }));
    }, [goals, t]);

    const getTips = () => [t('tip_1'), t('tip_2'), t('tip_3'), t('tip_4')];
    const [tipIndex, setTipIndex] = useState(0);

    const [newNote, setNewNote]         = useState('');
    const [noteFile, setNoteFile]       = useState<File | null>(null);
    const [newGoal, setNewGoal]         = useState({ title: '', description: '', period: '', priority: '' });

    useEffect(() => {
        if (!user) { router.push('/auth/login'); return; }
        loadAll();
    }, [user]);

    const loadAll = async () => {
        if (!user) return;
        try {
            const [rec, gls, nts] = await Promise.all([
                DentalService.getDailyRecords(user.id),
                DentalService.getUserGoals(user.id),
                DentalService.getNotes(user.id)
            ]);
            setDailyRecords(rec || []);
            setGoals(gls || []);
            setNotes(nts || []);
        } catch (err) {
            console.error("Veri yükleme hatası:", err);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = user?.firstName || '';
        if (hour < 12) return `${t('greeting_morning')} ${name}`;
        if (hour < 18) return `${t('greeting_afternoon')} ${name}`;
        return `${t('greeting_evening')} ${name}`;
    };

    const handleRandomTip = () => {
        setTipIndex((prev) => (prev + 1) % getTips().length);
    };

    const handleSaveNote = async () => {
        if (!user || !newNote.trim()) return;
        try {
            const saved = await DentalService.saveNoteWithImage(user.id, newNote, noteFile || undefined);
            const formattedNote: Note = {
                id: saved.id,
                note: saved.note || saved.description,
                date: saved.date,
                imageUrl: saved.imageUrl || saved.imagePath
            };
            setNotes(prev => [formattedNote, ...prev]);
            setNewNote('');
            setNoteFile(null);
            toast.current?.show({ severity: 'success', summary: t('completed'), detail: t('save') });
        } catch { 
            toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'Hata' }); 
        }
    };

    const confirmDeleteNote = (noteId: number) => {
        confirmDialog({
            message: 'Bu notu silmek istediğinize emin misiniz?',
            header: 'Notu Sil',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            acceptClassName: 'p-button-danger',
            accept: () => handleDeleteNote(noteId)
        });
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await DentalService.deleteNote(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            toast.current?.show({ severity: 'success', summary: t('completed'), detail: t('done') });
        } catch { }
    };

    const handleAddGoal = async () => {
        if (!user || !newGoal.title.trim()) return;
        try {
            await DentalService.addGoal({ ...newGoal, userId: user.id });
            setNewGoal({ title: '', description: '', period: '', priority: '' });
            loadAll(); 
        } catch { }
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            await DentalService.deleteGoal(id);
            setGoals(prev => prev.filter(g => g.id !== id));
            toast.current?.show({ severity: 'info', summary: 'Silindi', detail: 'Hedef kaldırıldı.' });
        } catch { }
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />
            
            <div className="col-12">
                <div className="mb-4 ml-2">
                    <h2 className="m-0 font-bold text-primary">{getGreeting()}</h2>
                    <small className="text-500">{t('dashboard_subtitle')}</small>
                </div>

                <div className="flex align-items-center gap-2 mb-3 ml-2">
                    <i className="pi pi-shield text-primary text-2xl"></i>
                    <h3 className="m-0 font-semibold">{t('dental_health_title')}</h3>
                </div>

                <TabView>
                    <TabPanel header={t('status_tab')} leftIcon="pi pi-chart-bar mr-2">
                        <div className="grid mt-2">
                            <div className="col-12 lg:col-6">
                                <div className="card shadow-1 border-round-xl p-4 h-full">
                                    <h5 className="mb-4 font-bold"><i className="pi pi-calendar mr-2 text-primary"></i>{t('daily_summary')}</h5>
                                    <div className="flex flex-column gap-3">
                                        {dailyRecords.length > 0 ? dailyRecords.map((rec, i) => (
                                            <div key={i} className="flex justify-content-between p-3 surface-50 border-round align-items-center border-left-3 border-primary">
                                                <div className="flex flex-column">
                                                    <span className="text-sm font-bold">{rec.date?.split('T')[0]}</span>
                                                    <div className="flex gap-2 mt-2">
                                                        <Tag value={`${rec.brushCount} ${t('brushing')}`} severity="warning" />
                                                        {rec.flossed && <Tag value={t('flossing')} severity="info" />}
                                                        {rec.mouthwash && <Tag value={t('mouthwash')} severity="success" />}
                                                    </div>
                                                </div>
                                                <i className="pi pi-check-circle text-green-500 text-xl"></i>
                                            </div>
                                        )) : <p className="text-500 text-sm">{t('no_data')}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 lg:col-6">
                                <div className="card shadow-1 border-round-xl p-4 h-full">
                                    <h5 className="mb-4 font-bold"><i className="pi pi-history mr-2 text-primary"></i>{t('recent_activities')}</h5>
                                    {activities.length > 0 ? activities.map(act => (
                                        <div key={act.id} className="p-2 mb-2 surface-50 border-round flex justify-content-between align-items-center">
                                            <div className="flex flex-column">
                                                <span className="font-bold text-sm">{act.goalTitle}</span>
                                                <div className="flex gap-2 align-items-center">
                                                    <small className="text-500">{act.date}</small>
                                                    {act.period && <small className="text-primary font-medium">| {act.period}</small>}
                                                </div>
                                            </div>
                                            <i className="pi pi-calendar-plus text-primary"></i>
                                        </div>
                                    )) : <p className="text-500 text-sm">{t('no_data')}</p>}
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <div className="card shadow-1 border-round-xl p-4 bg-blue-50">
                                    <h5 className="mb-3 font-bold"><i className="pi pi-pencil mr-2 text-primary"></i>{t('add_note')}</h5>
                                    <div className="grid">
                                        <div className="col-12 lg:col-8">
                                            <InputTextarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4} className="w-full" />
                                        </div>
                                        <div className="col-12 lg:col-4 flex flex-column gap-3">
                                            <Button icon="pi pi-image" label={t('upload_image')} className="w-full p-button-outlined bg-white" onClick={() => document.getElementById('file-upload')?.click()} />
                                            <input id="file-upload" type="file" hidden onChange={(e) => setNoteFile(e.target.files?.[0] || null)} />
                                            <Button icon="pi pi-save" label={t('save')} className="w-full" onClick={handleSaveNote} />
                                        </div>
                                    </div>
                                    <div className="grid mt-4">
                                        {notes.map(n => (
                                            <div key={n.id} className="col-12 md:col-6 lg:col-4">
                                                <div className="p-3 bg-white border-round shadow-1 h-full relative">
                                                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text absolute" style={{ top: '5px', right: '5px' }} onClick={() => confirmDeleteNote(n.id)} />
                                                    <p className="m-0 text-sm font-medium pr-5">{n.note}</p>
                                                    {n.imageUrl && <img src={`${API_BASE}${n.imageUrl}`} className="w-full mt-2 border-round" style={{maxHeight:'150px', objectFit:'cover'}} alt="note" />}
                                                    <div className="mt-2 text-right"><small className="text-400">{n.date}</small></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel header={t('goals_tab')} leftIcon="pi pi-list mr-2">
                        <div className="grid mt-2">
                            <div className="col-12 lg:col-4">
                                <div className="card shadow-1 border-round-xl p-4">
                                    <h5 className="text-primary font-bold mb-4">{t('new_goal_title')}</h5>
                                    <div className="flex flex-column gap-3">
                                        <InputText value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} placeholder={t('goal_title') + ' *'} />
                                        <InputText value={newGoal.period} onChange={(e) => setNewGoal({...newGoal, period: e.target.value})} placeholder={t('period') + ' *'} />
                                        <Dropdown value={newGoal.priority} options={[t('high'), t('medium'), t('low')]} onChange={(e) => setNewGoal({...newGoal, priority: e.value})} placeholder={t('priority')} />
                                        <Button label={t('save')} icon="pi pi-plus" className="w-full" onClick={handleAddGoal} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 lg:col-8">
                                <div className="card shadow-1 border-round-xl p-0 overflow-hidden">
                                    <DataTable value={goals} emptyMessage={t('no_goals')} responsiveLayout="scroll">
                                        <Column field="title" header={t('goal_title')} sortable></Column>
                                        <Column field="period" header={t('period')}></Column>
                                        <Column field="priority" header={t('priority')} body={(r) => <Tag value={r.priority} severity={r.priority === t('high') ? 'danger' : 'warning'} />}></Column>
                                        <Column header={t('actions')} body={(r) => <Button icon="pi pi-trash" text severity="danger" onClick={() => handleDeleteGoal(r.id)} />}></Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>

                <div className="card mt-4 shadow-1 border-round-xl p-3 bg-blue-50 flex align-items-center justify-content-between">
                    <div className="flex align-items-center gap-3">
                        <div className="bg-primary border-round p-2 flex align-items-center justify-content-center">
                            <i className="pi pi-bookmark-fill text-white"></i>
                        </div>
                        <div>
                            <small className="block text-primary font-bold uppercase" style={{fontSize: '0.7rem'}}>{t('suggestion_title')}</small>
                            <span className="text-sm font-medium">{getTips()[tipIndex]}</span>
                        </div>
                    </div>
                    <Button icon="pi pi-refresh" className="p-button-rounded p-button-text" onClick={handleRandomTip} />
                </div>
            </div>
        </div>
    );
};

export default DentalHealthPage;