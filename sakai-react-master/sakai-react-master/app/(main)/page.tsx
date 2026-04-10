'use client';
import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DentalService } from '../../demo/service/DentalService';
import { useAuth } from '@/layout/context/AuthContext';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        brushCount: 0,
        flossed: false,
        mouthwash: false,
        healthScore: 0,
        streak: 0,
        weeklyData: [0, 0, 0, 0, 0, 0, 0]
    });

    const tipKeys = ['daily_dental_tip_content', 'tip_1', 'tip_2', 'tip_3', 'tip_4'];
    const [currentTipKey, setCurrentTipKey] = useState(tipKeys[0]);

    // Dinamik selamlama için saat kontrolü yapan fonksiyon
    const getGreetingKey = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'greeting_morning';    // 05:00 - 11:59 -> Günaydın
        if (hour >= 12 && hour < 18) return 'greeting_afternoon'; // 12:00 - 17:59 -> Tünaydın / İyi Günler
        return 'greeting_evening';                                // Geri kalan -> İyi Akşamlar
    };

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!user || !mounted) return;

        const loadDashboard = async () => {
            const data = await DentalService.getDashboardStats(user.id);
            if (data) {
                const localStreak = parseInt(localStorage.getItem(`streak_${user.id}`) || '0');
                const serverStreak = data.streak ?? 0;
                
                let finalStreak = serverStreak > 0 ? serverStreak : localStreak;

                setStats({
                    brushCount:  data.brushCount  ?? 0,
                    flossed:     data.flossed     ?? false,
                    mouthwash:   data.mouthwash   ?? false,
                    healthScore: Math.min(((data.brushCount ?? 0) * 20) + (data.flossed ? 20 : 0) + (data.mouthwash ? 20 : 0), 100),
                    streak:      finalStreak,
                    weeklyData:  data.weeklyData  ?? [0, 0, 0, 0, 0, 0, 0]
                });
            }
        };

        loadDashboard();
    }, [user, mounted]);

    const updateAndSync = async (newBrush: number, newFloss: boolean, newWash: boolean) => {
        if (!user) return;
        try {
            const result = await DentalService.upsertRecord({
                userId: user.id,
                brushCount: newBrush,
                flossed: newFloss,
                mouthwash: newWash
            });
            
            setStats(prev => {
                const serverStreak = result?.streak ?? result?.Streak ?? 0;
                let finalStreak = serverStreak > 0 ? serverStreak : prev.streak;

                if (finalStreak === 0 && (newBrush > 0 || newFloss || newWash)) {
                    finalStreak = 1;
                }

                localStorage.setItem(`streak_${user.id}`, finalStreak.toString());

                return {
                    ...prev,
                    brushCount: newBrush,
                    flossed: newFloss,
                    mouthwash: newWash,
                    healthScore: Math.min((newBrush * 20) + (newFloss ? 20 : 0) + (newWash ? 20 : 0), 100),
                    streak: finalStreak
                };
            });
        } catch (e) {
            console.error("Güncelleme hatası:", e);
        }
    };

    const handleBrushed = () => stats.brushCount < 3 && updateAndSync(stats.brushCount + 1, stats.flossed, stats.mouthwash);
    const handleFloss = () => updateAndSync(stats.brushCount, !stats.flossed, stats.mouthwash);
    const handleMouthwash = () => updateAndSync(stats.brushCount, stats.flossed, !stats.mouthwash);

    const renderDayActivity = (dayKey: string, index: number) => {
        const jsDay = new Date().getDay();
        const todayIdx = jsDay === 0 ? 6 : jsDay - 1; 
        const isToday = index === todayIdx;
        const brushValue = isToday ? stats.brushCount : (stats.weeklyData[index] || 0);
        const flossActive = isToday ? stats.flossed : false;
        const washActive = isToday ? stats.mouthwash : false;

        return (
            <div key={dayKey} className={`flex align-items-center justify-content-between p-3 border-round mb-2 ${isToday ? 'bg-primary-reverse shadow-1' : 'surface-ground'}`}>
                <div className="flex align-items-center">
                    <span className={`font-bold mr-3 ${isToday ? 'text-primary' : 'text-700'}`} style={{ width: '45px' }}>{t(dayKey)}</span>
                    {isToday && <span className="p-tag p-tag-info p-tag-rounded text-xs">{t('today')}</span>}
                </div>
                <div className="flex gap-4">
                    <div className="flex align-items-center gap-2"><i className={`pi pi-sun ${brushValue > 0 ? 'text-orange-500' : 'text-300'}`}></i><span>{brushValue}/3</span></div>
                    <div className="flex align-items-center gap-2"><i className={`pi pi-check-circle ${flossActive ? 'text-cyan-500' : 'text-300'}`}></i><span>{t('flossing')}</span></div>
                    <div className="flex align-items-center gap-2"><i className={`pi ${washActive ? 'pi-check-circle text-teal-500' : 'pi-droplet text-300'}`}></i><span>{t('mouthwash')}</span></div>
                </div>
            </div>
        );
    };

    if (!mounted || !user) return null;
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card mb-3 py-3 px-4 border-none shadow-1 bg-primary-reverse">
                    {/* Selamlama burada dinamik hale getirildi */}
                    <h2 className="text-900 font-bold m-0">{t(getGreetingKey())}, {user?.firstName || user?.username} 👋</h2>
                    <p className="text-600 m-0 mt-1">{t('dashboard_subtitle')}</p> 
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ minHeight: '190px' }}>
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('health_score')}</span>
                            <div className="text-900 font-medium text-xl">%{stats.healthScore}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-heart-fill text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{t('good_job')}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ minHeight: '190px' }}>
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('brushing')}</span>
                            <div className="text-900 font-medium text-xl">{stats.brushCount} / 3</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-sun text-orange-500 text-xl" />
                        </div>
                    </div>
                    <button className={`p-button p-component p-button-sm w-full mb-2 ${stats.brushCount >= 3 ? 'p-button-success' : ''}`} onClick={handleBrushed} disabled={stats.brushCount >= 3}>
                        {stats.brushCount >= 3 ? t('done') : t('brushed_btn')}
                    </button>
                    <span className="text-500 text-xs block">{t('tip_4')}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ minHeight: '190px' }}>
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('flossing')}</span>
                            <div className="text-900 font-medium text-xl">{stats.flossed ? t('done') : t('todo')}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <Button label={stats.flossed ? t('done') : (t('not_done') || 'Yapılmadı')} size="small" outlined={!stats.flossed} severity={stats.flossed ? 'success' : undefined} className="w-full mb-2" onClick={handleFloss} />
                    <span className="text-500 text-xs block">{t('floss_desc')}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ minHeight: '190px' }}>
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('mouthwash')}</span>
                            <div className="text-900 font-medium text-xl">{stats.mouthwash ? t('done') : t('todo')}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-teal-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-droplet text-teal-500 text-xl" />
                        </div>
                    </div>
                    <Button label={stats.mouthwash ? t('done') : (t('not_done') || 'Yapılmadı')} size="small" outlined={!stats.mouthwash} severity={stats.mouthwash ? 'success' : undefined} className="w-full mb-2" onClick={handleMouthwash} />
                    <span className="text-500 text-xs block">{t('wash_desc')}</span>
                </div>
            </div>

            <div className="col-12 xl:col-8">
                <div className="card"><h5 className="mb-4">{t('weekly_summary')}</h5>{dayKeys.map((key, index) => renderDayActivity(key, index))}</div>
            </div>

            <div className="col-12 xl:col-4">
                <div className="card mb-4">
                    <span className="block text-500 font-medium mb-3">{t('streak')}</span>
                    <div className="text-900 font-bold text-3xl text-purple-500">{stats.streak} {t('streak_unit')} 🔥</div>
                </div>
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h5>{t('daily_tip')}</h5>
                        <Button icon="pi pi-sync" rounded text onClick={() => {
                            const randomIndex = Math.floor(Math.random() * tipKeys.length);
                            setCurrentTipKey(tipKeys[randomIndex]);
                        }} />
                    </div>
                    <div className="p-4 border-round bg-primary-reverse text-primary-contrast font-medium shadow-2">{t(currentTipKey)}</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;