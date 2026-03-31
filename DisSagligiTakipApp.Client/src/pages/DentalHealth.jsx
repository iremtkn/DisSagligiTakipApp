import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DentalHealth.css';

const API = 'http://localhost:5259/api';

const PRIORITY_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };
const PRIORITY_COLORS = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high' };

function getLast7Days() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    });
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function DentalHealth() {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userData?.id;

    const [activeTab, setActiveTab] = useState('status');

    const [goals, setGoals] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [dailyRecords, setDailyRecords] = useState([]);
    const [notes, setNotes] = useState([]);
    const [tip, setTip] = useState('');
    const [tipLoading, setTipLoading] = useState(false);
    const [activityForms, setActivityForms] = useState({});
    const [noteForm, setNoteForm] = useState({ description: '', image: null, imagePreview: '' });
    const [noteError, setNoteError] = useState('');
    const [noteSaving, setNoteSaving] = useState(false);

    const [goalForm, setGoalForm] = useState({ title: '', description: '', period: '', priority: 'medium' });
    const [goalErrors, setGoalErrors] = useState({});
    const [goalSaving, setGoalSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchGoals = useCallback(async () => {
        if (!userId) return;
        const res = await axios.get(`${API}/goal/user/${userId}`);
        setGoals(res.data);
        const forms = {};
        res.data.forEach(g => {
            forms[g.id] = { date: new Date().toISOString().split('T')[0], time: '', duration: '', isApplied: false };
        });
        setActivityForms(forms);
    }, [userId]);

    const fetchRecentActivities = useCallback(async () => {
        if (!userId) return;
        const res = await axios.get(`${API}/activity/last7days/${userId}`);
        setRecentActivities(res.data);
    }, [userId]);

    const fetchDailyRecords = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${API}/dailyrecord/last7days/${userId}`);
            setDailyRecords(res.data);
        } catch {
            setDailyRecords([]);
        }
    }, [userId]);

    const fetchNotes = useCallback(async () => {
        if (!userId) return;
        const res = await axios.get(`${API}/note/user/${userId}`);
        setNotes(res.data);
    }, [userId]);

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

    useEffect(() => {
        if (!userId) { navigate('/login'); return; }
        fetchGoals();
        fetchRecentActivities();
        fetchDailyRecords();
        fetchNotes();
        fetchTip();
    }, [userId, navigate, fetchGoals, fetchRecentActivities, fetchDailyRecords, fetchNotes, fetchTip]);

    const handleActivitySave = async (goalId) => {
        const form = activityForms[goalId];
        if (!form.date || !form.time || !form.duration) {
            setActivityForms(f => ({ ...f, [goalId]: { ...f[goalId], error: 'Tarih, saat ve süre zorunludur.', success: '' } }));
            return;
        }
        try {
            await axios.post(`${API}/activity`, {
                goalId,
                date: new Date(form.date),
                time: form.time,
                duration: parseInt(form.duration),
                isApplied: form.isApplied
            });
            setActivityForms(f => ({ ...f, [goalId]: { date: new Date().toISOString().split('T')[0], time: '', duration: '', isApplied: false, success: 'Kaydedildi!', error: '' } }));
            fetchRecentActivities();
            fetchGoals();
        } catch {
            setActivityForms(f => ({ ...f, [goalId]: { ...f[goalId], error: 'Kayıt başarısız.', success: '' } }));
        }
    };

    const handleNoteSave = async () => {
        if (!noteForm.description.trim()) { setNoteError('Açıklama boş bırakılamaz.'); return; }
        setNoteSaving(true);
        setNoteError('');
        try {
            const fd = new FormData();
            fd.append('userId', userId);
            fd.append('description', noteForm.description);
            if (noteForm.image) fd.append('image', noteForm.image);
            await axios.post(`${API}/note`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNoteForm({ description: '', image: null, imagePreview: '' });
            fetchNotes();
        } catch {
            setNoteError('Not kaydedilemedi.');
        } finally {
            setNoteSaving(false);
        }
    };

    const handleNoteDelete = async (noteId) => {
        if (!window.confirm("Bu notu silmek istediğinize emin misiniz?")) return;
        try {
            await axios.delete(`${API}/note/${noteId}`);
            fetchNotes();
        } catch (err) {
            alert("Not silinirken bir hata oluştu.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNoteForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }));
    };

    const handleGoalSave = async () => {
        const errs = {};
        if (!goalForm.title.trim()) errs.title = 'Başlık boş bırakılamaz.';
        if (!goalForm.period.trim()) errs.period = 'Periyot boş bırakılamaz.';
        if (Object.keys(errs).length) { setGoalErrors(errs); return; }
        setGoalSaving(true);
        try {
            await axios.post(`${API}/goal`, { userId, ...goalForm });
            setGoalForm({ title: '', description: '', period: '', priority: 'medium' });
            setGoalErrors({});
            fetchGoals();
        } catch (err) {
            setGoalErrors({ general: err.response?.data?.message || 'Kayıt başarısız.' });
        } finally {
            setGoalSaving(false);
        }
    };

    const handleDeleteClick = async (goal) => {
        const res = await axios.get(`${API}/goal/${goal.id}/has-activities`);
        setDeleteConfirm({ goalId: goal.id, goalTitle: goal.title, hasActivities: res.data.hasActivities });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        await axios.delete(`${API}/goal/${deleteConfirm.goalId}`);
        setDeleteConfirm(null);
        fetchGoals();
        fetchRecentActivities();
    };

    const getDailyRecord = (dateStr) => {
        return dailyRecords.find(r => {
            const d = (r.date || r.Date || '').split('T')[0];
            return d === dateStr;
        });
    };

    const last7Days = getLast7Days();
    const filledDays = last7Days.filter(d => {
        const r = getDailyRecord(d);
        return r && (r.brushCount > 0 || r.flossed || r.mouthwash);
    });

    return (
        <div className="dh-page">
            <div className="dh-header">
                <button className="dh-back" onClick={() => navigate('/dashboard')}>← Geri</button>
                <h1 className="dh-title">🦷 Ağız ve Diş Sağlığı</h1>
            </div>

            <div className="dh-tabs">
                <button className={`dh-tab ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>
                    📊 Durum
                </button>
                <button className={`dh-tab ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
                    🎯 Hedefler
                </button>
            </div>

            {activeTab === 'status' && (
                <div className="dh-content">
                    <div className="dh-card">
                        <h2 className="dh-card-title">🏠 Günlük Takip Özeti</h2>
                        <p className="dh-section-desc">Anasayfadan girilen fırçalama, diş ipi ve gargara kayıtları</p>
                        {filledDays.length === 0 ? (
                            <p className="dh-empty">Son 7 günde anasayfadan kayıt girilmemiş.</p>
                        ) : (
                            <div className="dh-daily-list">
                                {filledDays.map(dateStr => {
                                    const r = getDailyRecord(dateStr);
                                    return (
                                        <div key={dateStr} className="dh-daily-item">
                                            <p className="dh-daily-date">{formatDate(dateStr)}</p>
                                            <div className="dh-daily-badges">
                                                {r.brushCount > 0 && <span className="dh-daily-badge brushed">🪥 Fırçalama: {r.brushCount}/3</span>}
                                                {r.flossed && <span className="dh-daily-badge flossed">🧵 Diş ipi</span>}
                                                {r.mouthwash && <span className="dh-daily-badge mouthwash">💧 Gargara</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="dh-card">
                        <h2 className="dh-card-title">📅 Son 7 Gün — Hedef Aktiviteleri</h2>
                        {recentActivities.length === 0 ? (
                            <p className="dh-empty">Son 7 günde kayıtlı aktivite bulunmuyor.</p>
                        ) : (
                            <div className="dh-activity-list">
                                {recentActivities.map(a => (
                                    <div key={a.id} className="dh-activity-item">
                                        <div className="dh-activity-left">
                                            <span className={`dh-applied ${a.isApplied ? 'yes' : 'no'}`}>{a.isApplied ? '✓' : '✗'}</span>
                                            <div>
                                                <p className="dh-activity-goal">{a.goalTitle}</p>
                                                <p className="dh-activity-meta">{a.date} · {a.time} · {a.duration} dk</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="dh-card">
                        <h2 className="dh-card-title">📝 Aktivite Gir</h2>
                        {goals.length === 0 ? (
                            <p className="dh-empty">Henüz hedef eklenmemiş.</p>
                        ) : (
                            <div className="dh-goal-forms">
                                {goals.map(goal => {
                                    const form = activityForms[goal.id] || {};
                                    return (
                                        <div key={goal.id} className="dh-goal-form">
                                            <div className="dh-goal-form-header">
                                                <span className="dh-goal-form-title">{goal.title}</span>
                                                <span className={`dh-priority ${PRIORITY_COLORS[goal.priority] || ''}`}>
                                                    {PRIORITY_LABELS[goal.priority] || goal.priority}
                                                </span>
                                            </div>
                                            <div className="dh-form-row">
                                                <div className="dh-form-field">
                                                    <label className="dh-label">Tarih</label>
                                                    <input type="date" className="dh-input" value={form.date || ''} onChange={e => setActivityForms(f => ({ ...f, [goal.id]: { ...f[goal.id], date: e.target.value, error: '', success: '' } }))} />
                                                </div>
                                                <div className="dh-form-field">
                                                    <label className="dh-label">Saat</label>
                                                    <input type="time" className="dh-input" value={form.time || ''} onChange={e => setActivityForms(f => ({ ...f, [goal.id]: { ...f[goal.id], time: e.target.value, error: '', success: '' } }))} />
                                                </div>
                                                <div className="dh-form-field">
                                                    <label className="dh-label">Süre (dk)</label>
                                                    <input type="number" className="dh-input" value={form.duration || ''} onChange={e => setActivityForms(f => ({ ...f, [goal.id]: { ...f[goal.id], duration: e.target.value, error: '', success: '' } }))} />
                                                </div>
                                            </div>
                                            <div className="dh-form-check">
                                                <input type="checkbox" id={`applied-${goal.id}`} checked={form.isApplied || false} onChange={e => setActivityForms(f => ({ ...f, [goal.id]: { ...f[goal.id], isApplied: e.target.checked } }))} />
                                                <label htmlFor={`applied-${goal.id}`}>Uygulandı</label>
                                            </div>
                                            {form.error && <p className="dh-error">{form.error}</p>}
                                            {form.success && <p className="dh-success">{form.success}</p>}
                                            <button className="dh-btn-primary" onClick={() => handleActivitySave(goal.id)}>Kaydet</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="dh-card">
                        <h2 className="dh-card-title">🗒️ Not Ekle</h2>
                        <div className="dh-form-field">
                            <label className="dh-label">Açıklama</label>
                            <textarea className="dh-textarea" placeholder="Notunuzu yazın..." value={noteForm.description} onChange={e => setNoteForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                        </div>
                        <div className="dh-form-field">
                            <label className="dh-label">Görsel (isteğe bağlı)</label>
                            <input type="file" className="dh-file-input" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleImageChange} />
                            {noteForm.imagePreview && <img src={noteForm.imagePreview} alt="Önizleme" className="dh-image-preview" />}
                        </div>
                        {noteError && <p className="dh-error">{noteError}</p>}
                        <button className="dh-btn-primary" onClick={handleNoteSave} disabled={noteSaving}>
                            {noteSaving ? 'Kaydediliyor...' : 'Notu Kaydet'}
                        </button>

                        {notes.length > 0 && (
                            <div className="dh-notes-list">
                                {notes.map(n => (
                                    <div key={n.id} className="dh-note-item">
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                            <div style={{flex: 1}}>
                                                <p className="dh-note-date">{n.createdDate}</p>
                                                <p className="dh-note-desc">{n.description}</p>
                                            </div>
                                            {/* Not Silme Butonu */}
                                            <button className="dh-btn-delete" onClick={() => handleNoteDelete(n.id)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>🗑️</button>
                                        </div>
                                        {n.imagePath && <img src={`http://localhost:5259${n.imagePath}`} alt="Not görseli" className="dh-note-image" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="dh-card dh-tip-card">
                        <div className="dh-tip-header">
                            <span className="dh-tip-badge">💡 Öneri</span>
                            <button className="dh-tip-refresh" onClick={fetchTip} disabled={tipLoading}>
                                {tipLoading ? '...' : '↻ Yeni'}
                            </button>
                        </div>
                        <p className="dh-tip-text">{tip || '...'}</p>
                    </div>
                </div>
            )}

            {activeTab === 'goals' && (
                <div className="dh-content">
                    <div className="dh-card">
                        <h2 className="dh-card-title">➕ Yeni Hedef Ekle</h2>
                        <div className="dh-form-field">
                            <label className="dh-label">Başlık *</label>
                            <input type="text" className={`dh-input ${goalErrors.title ? 'has-error' : ''}`} placeholder="Hedef başlığı" value={goalForm.title} onChange={e => { setGoalForm(f => ({ ...f, title: e.target.value })); setGoalErrors(e2 => ({ ...e2, title: '' })); }} />
                            {goalErrors.title && <p className="dh-error">{goalErrors.title}</p>}
                        </div>
                        <div className="dh-form-field">
                            <label className="dh-label">Açıklama</label>
                            <textarea className="dh-textarea" placeholder="Hedef açıklaması..." value={goalForm.description} onChange={e => setGoalForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                        </div>
                        <div className="dh-form-row">
                            <div className="dh-form-field">
                                <label className="dh-label">Periyot *</label>
                                <input type="text" className={`dh-input ${goalErrors.period ? 'has-error' : ''}`} placeholder="Günde bir..." value={goalForm.period} onChange={e => { setGoalForm(f => ({ ...f, period: e.target.value })); setGoalErrors(e2 => ({ ...e2, period: '' })); }} />
                                {goalErrors.period && <p className="dh-error">{goalErrors.period}</p>}
                            </div>
                            <div className="dh-form-field">
                                <label className="dh-label">Önem Derecesi</label>
                                <select className="dh-input" value={goalForm.priority} onChange={e => setGoalForm(f => ({ ...f, priority: e.target.value }))}>
                                    <option value="low">Düşük</option>
                                    <option value="medium">Orta</option>
                                    <option value="high">Yüksek</option>
                                </select>
                            </div>
                        </div>
                        {goalErrors.general && <p className="dh-error">{goalErrors.general}</p>}
                        <button className="dh-btn-primary" onClick={handleGoalSave} disabled={goalSaving}>Kaydet</button>
                    </div>

                    <div className="dh-card">
                        <h2 className="dh-card-title">📋 Kayıtlı Hedefler</h2>
                        {goals.length === 0 ? <p className="dh-empty">Henüz hedef eklenmemiş.</p> : (
                            <div className="dh-goal-list">
                                {goals.map(goal => (
                                    <div key={goal.id} className="dh-goal-item">
                                        <div className="dh-goal-info">
                                            <div className="dh-goal-header">
                                                <span className="dh-goal-title">{goal.title}</span>
                                                <span className={`dh-priority ${PRIORITY_COLORS[goal.priority] || ''}`}>{PRIORITY_LABELS[goal.priority]}</span>
                                            </div>
                                            {goal.description && <p className="dh-goal-desc">{goal.description}</p>}
                                            <p className="dh-goal-meta">🔄 {goal.period} · 📊 {goal.activityCount} aktivite</p>
                                        </div>
                                        <button className="dh-btn-delete" onClick={() => handleDeleteClick(goal)}>🗑️</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="dh-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="dh-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="dh-modal-title">Hedefi Sil</h3>
                        <p className="dh-modal-text"><strong>"{deleteConfirm.goalTitle}"</strong> hedefini silmek istediğinize emin misiniz?</p>
                        {deleteConfirm.hasActivities && <div className="dh-modal-warning">⚠️ Bu hedefe ait aktivite kayıtları da silinecektir.</div>}
                        <div className="dh-modal-actions">
                            <button className="dh-btn-cancel" onClick={() => setDeleteConfirm(null)}>İptal</button>
                            <button className="dh-btn-danger" onClick={handleDeleteConfirm}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DentalHealth;