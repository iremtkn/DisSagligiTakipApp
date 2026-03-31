import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API = 'http://localhost:5259/api';

function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
}

function formatDayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('tr-TR', { weekday: 'short' });
}

function formatDayNum(dateStr) {
    return new Date(dateStr + 'T00:00:00').getDate();
}

function isToday(dateStr) {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
}

function getDayScore(record) {
    let score = 0;
    if (record.brushCount >= 1) score++;
    if (record.brushCount >= 2) score++;
    if (record.brushCount >= 3) score++;
    if (record.flossed) score++;
    if (record.mouthwash) score++;
    return score; 
}

function Dashboard() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id;
    const displayName = userData?.firstName || userData?.FirstName || userData?.name || 'Kullanıcı';
    const userEmail = userData?.email || userData?.Email || '';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';

    const [tip, setTip] = useState('');
    const [tipLoading, setTipLoading] = useState(false);
    const [weekRecords, setWeekRecords] = useState([]);
    const [todayRecord, setTodayRecord] = useState({ brushCount: 0, flossed: false, mouthwash: false });
    const [saving, setSaving] = useState(false);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchTip = useCallback(async () => {
        setTipLoading(true);
        try {
            const res = await axios.get(`${API}/suggestion/random`);
            setTip(res.data.text);
        } catch {
            setTip('Dişlerinizi günde en az 2 kez fırçalamayı unutmayın!');
        } finally {
            setTipLoading(false);
        }
    }, []);

    const fetchWeekData = useCallback(async () => {
        if (!userId) return;
        try {
            const [weekRes, todayRes] = await Promise.all([
                axios.get(`${API}/dailyrecord/last7days/${userId}`),
                axios.get(`${API}/dailyrecord/today/${userId}`)
            ]);
            setWeekRecords(weekRes.data);
            setTodayRecord({
                brushCount: todayRes.data.brushCount ?? 0,
                flossed: todayRes.data.flossed ?? false,
                mouthwash: todayRes.data.mouthwash ?? false,
            });
        } catch (err) {
            console.error('Veri yüklenemedi:', err);
        }
    }, [userId]);

    useEffect(() => {
        fetchTip();
        fetchWeekData();
    }, [fetchTip, fetchWeekData]);

    const saveRecord = async (updated) => {
        if (!userId) return;
        setSaving(true);
        try {
            await axios.post(`${API}/dailyrecord/upsert`, {
                userId,
                brushCount: updated.brushCount,
                flossed: updated.flossed,
                mouthwash: updated.mouthwash,
            });
            setTodayRecord(updated);
            await fetchWeekData();
        } catch (err) {
            console.error('Kayıt hatası:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleBrush = () => {
        if (todayRecord.brushCount >= 3) return;
        saveRecord({ ...todayRecord, brushCount: todayRecord.brushCount + 1 });
    };
    const handleFloss = () => saveRecord({ ...todayRecord, flossed: !todayRecord.flossed });
    const handleMouthwash = () => saveRecord({ ...todayRecord, mouthwash: !todayRecord.mouthwash });

    const last7Days = getLast7Days();
    
    const getRecordForDay = (dateStr) => {
        const found = weekRecords.find(r => {
            const recordDate = (r.date || r.Date || '').split('T')[0];
            return recordDate === dateStr;
        });
        return found || { brushCount: 0, flossed: false, mouthwash: false };
    };

    const streak = last7Days.reduce((acc, d) => {
        const r = getRecordForDay(d);
        return (r.brushCount > 0 || r.flossed || r.mouthwash) ? acc + 1 : 0;
    }, 0);

    const todayScore = getDayScore(todayRecord);
    const scorePercent = Math.round((todayScore / 5) * 100);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { key: 'dashboard', icon: '◈', label: 'Ana Sayfa', action: () => setActiveNav('dashboard') },
        { key: 'dental',    icon: '◉', label: 'Ağız ve Diş Sağlığı', action: () => { setActiveNav('dental'); navigate('/dental-health'); } },
        { key: 'profile',   icon: '◎', label: 'Profil', action: () => { setActiveNav('profile'); navigate('/profile'); } },
    ];

    return (
        <div className="db-root" onClick={() => sidebarOpen && setSidebarOpen(false)}>
            <aside className={`db-sidebar ${sidebarOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="db-logo">
                    <span className="db-logo-icon">🦷</span>
                    <span className="db-logo-text">DentalCare</span>
                </div>
                <div className="db-user-card">
                    <div className="db-avatar">{displayName.charAt(0).toUpperCase()}</div>
                    <div className="db-user-info">
                        <p className="db-user-name">{displayName}</p>
                        <p className="db-user-email">{userEmail}</p>
                    </div>
                </div>
                <nav className="db-nav">
                    {navItems.map(item => (
                        <button key={item.key} className={`db-nav-item ${activeNav === item.key ? 'active' : ''}`} onClick={item.action}>
                            <span className="db-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="db-sidebar-bottom">
                    <button className="db-logout" onClick={handleLogout}>
                        <span>⏻</span>
                        <span>Güvenli Çıkış</span>
                    </button>
                </div>
            </aside>

            <div className="db-content">
                <header className="db-topbar">
                    <button className="db-hamburger" onClick={e => { e.stopPropagation(); setSidebarOpen(v => !v); }}>☰</button>
                    <div className="db-topbar-greeting">
                        <span className="db-greeting-text">{greeting},</span>
                        <span className="db-greeting-name">{displayName}</span>
                    </div>
                    <div className="db-topbar-date">
                        {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </header>

                <div className="db-main">
                    <div className="db-hero">
                        <div className="db-hero-left">
                            <p className="db-hero-label">Bugünkü Sağlık Skoru</p>
                            <div className="db-score-ring">
                                <svg viewBox="0 0 80 80" className="db-ring-svg">
                                    <circle cx="40" cy="40" r="32" className="db-ring-bg" />
                                    <circle cx="40" cy="40" r="32" className="db-ring-fill" strokeDasharray={`${scorePercent * 2.01} 201`} strokeDashoffset="0" />
                                </svg>
                                <span className="db-ring-num">{scorePercent}<span className="db-ring-pct">%</span></span>
                            </div>
                            <p className="db-hero-sub">
                                {scorePercent === 100 ? '🎉 Mükemmel gün!' : scorePercent >= 60 ? '👍 İyi gidiyorsun!' : scorePercent > 0  ? '💪 Devam et!' : '🌅 Güne başla!'}
                            </p>
                        </div>
                        <div className="db-hero-right">
                            <p className="db-hero-label">🔥 Seri</p>
                            <p className="db-streak-num">{streak}<span className="db-streak-unit"> gün</span></p>
                            <p className="db-hero-sub">Üst üste aktif gün</p>
                            <div className="db-mini-checks">
                                <div className={`db-mini-check ${todayRecord.brushCount > 0 ? 'done' : ''}`}><span>🪥</span><span>{todayRecord.brushCount}/3</span></div>
                                <div className={`db-mini-check ${todayRecord.flossed ? 'done' : ''}`}><span>🧵</span><span>{todayRecord.flossed ? '✓' : '–'}</span></div>
                                <div className={`db-mini-check ${todayRecord.mouthwash ? 'done' : ''}`}><span>💧</span><span>{todayRecord.mouthwash ? '✓' : '–'}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="db-actions-grid">
                        <div className="db-card">
                            <div className="db-card-head"><span className="db-card-icon">🪥</span><h3 className="db-card-title">Diş Fırçalama</h3></div>
                            <div className="db-brush-dots">{[1,2,3].map(i => <div key={i} className={`db-dot ${i <= todayRecord.brushCount ? 'done' : ''}`} />)}</div>
                            <p className="db-card-count">{todayRecord.brushCount} <span>/ 3 seans</span></p>
                            <button className={`db-action-btn ${todayRecord.brushCount >= 3 ? 'completed' : ''}`} onClick={handleBrush} disabled={todayRecord.brushCount >= 3 || saving}>
                                {todayRecord.brushCount >= 3 ? '✓ Tamamlandı' : saving ? '...' : 'Fırçaladım'}
                            </button>
                        </div>
                        <div className={`db-card db-toggle-card ${todayRecord.flossed ? 'active' : ''}`} onClick={handleFloss}>
                            <div className="db-card-head"><span className="db-card-icon">🧵</span><h3 className="db-card-title">Diş İpi</h3></div>
                            <p className="db-card-desc">Fırçanın ulaşamadığı bölgeleri temizler</p>
                            <div className="db-toggle-status">{todayRecord.flossed ? <span className="db-status-done">✓ Yapıldı</span> : <span className="db-status-todo">Dokunmak için tıkla</span>}</div>
                        </div>
                        <div className={`db-card db-toggle-card ${todayRecord.mouthwash ? 'active' : ''}`} onClick={handleMouthwash}>
                            <div className="db-card-head"><span className="db-card-icon">💧</span><h3 className="db-card-title">Ağız Gargarası</h3></div>
                            <p className="db-card-desc">Bakterileri azaltır, nefesi tazeler</p>
                            <div className="db-toggle-status">{todayRecord.mouthwash ? <span className="db-status-done">✓ Yapıldı</span> : <span className="db-status-todo">Dokunmak için tıkla</span>}</div>
                        </div>
                    </div>

                    <div className="db-card db-week-card">
                        <h3 className="db-card-title">📅 Son 7 Günlük Özet</h3>
                        <div className="db-week-row">
                            {last7Days.map(dateStr => {
                                const r = getRecordForDay(dateStr);
                                const score = getDayScore(r);
                                const pct = Math.round((score / 5) * 100);
                                return (
                                    <div key={dateStr} className={`db-week-col ${isToday(dateStr) ? 'today' : ''}`}>
                                        <span className="db-week-day">{formatDayLabel(dateStr)}</span>
                                        <span className="db-week-num">{formatDayNum(dateStr)}</span>
                                        <div className="db-week-bar-wrap"><div className="db-week-bar-fill" style={{ height: `${pct}%` }} /></div>
                                        <span className="db-week-pct">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="db-week-legend">
                            <span>🪥 Fırçalama (3 puan)</span>
                            <span>🧵 Diş ipi (1 puan)</span>
                            <span>💧 Gargara (1 puan)</span>
                        </div>
                    </div>

                    <div className="db-card db-tip-card">
                        <div className="db-tip-badge">💡 Günün Önerisi</div>
                        <p className="db-tip-text">{tip || '...'}</p>
                        <button className="db-tip-btn" onClick={fetchTip} disabled={tipLoading}>
                            {tipLoading ? 'Yükleniyor...' : '↻ Yeni Öneri'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;