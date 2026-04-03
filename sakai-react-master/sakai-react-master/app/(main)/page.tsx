/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import React, { useContext, useEffect, useState } from 'react';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { useTranslation } from 'react-i18next';
import { ChartData, ChartOptions } from 'chart.js';

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { layoutConfig } = useContext(LayoutContext);
    
    const [todayRecord] = useState({ brushCount: 2, flossed: true, mouthwash: false });
    const [scorePercent] = useState(60);

    const [lineData, setLineData] = useState<ChartData>({ datasets: [] });
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});

    const getDaysOfWeek = () => {
        const lang = i18n.language.split('-')[0] || 'tr';
        const days: any = {
            tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
        };
        return days[lang] || days['tr'];
    };

    useEffect(() => {
        const data: ChartData = {
            labels: getDaysOfWeek(),
            datasets: [
                {
                    label: t('brushing'),
                    data: [3, 2, 3, 3, 2, 1, 3],
                    fill: false,
                    backgroundColor: '#4f7df3',
                    borderColor: '#4f7df3',
                    tension: 0.4
                },
                {
                    label: t('flossing'),
                    data: [1, 0, 1, 1, 0, 1, 1],
                    fill: false,
                    backgroundColor: '#00bb7e',
                    borderColor: '#00bb7e',
                    tension: 0.4
                },
                {
                    label: t('mouthwash'),
                    data: [1, 1, 0, 1, 1, 0, 1],
                    fill: false,
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800',
                    tension: 0.4
                }
            ]
        };

        const options: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' },
                    grid: { color: layoutConfig.colorScheme === 'light' ? '#ebedef' : 'rgba(160, 167, 181, .3)' }
                },
                y: {
                    min: 0,
                    max: 3,
                    ticks: { 
                        stepSize: 1,
                        color: layoutConfig.colorScheme === 'light' ? '#495057' : '#ebedef' 
                    },
                    grid: { color: layoutConfig.colorScheme === 'light' ? '#ebedef' : 'rgba(160, 167, 181, .3)' }
                }
            }
        };

        setLineData(data);
        setLineOptions(options);
    }, [i18n.language, layoutConfig.colorScheme, t]); 

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('health_score')}</span>
                            <div className="text-900 font-medium text-xl">%{scorePercent}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-heart-fill text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">{t('good_job')}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('brushing')}</span>
                            <div className="text-900 font-medium text-xl">{todayRecord.brushCount} / 3</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-sun text-orange-500 text-xl" />
                        </div>
                    </div>
                    <button className="p-button p-component p-button-sm p-button-outlined w-full">{t('brushed_btn')}</button>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('flossing')}</span>
                            <div className="text-900 font-medium text-xl">{todayRecord.flossed ? t('done') : t('todo')}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-check-circle text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">{t('floss_desc')}</span>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{t('streak')}</span>
                            <div className="text-900 font-medium text-xl">5 {t('streak_unit')}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-bolt text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500">{t('active_days')}</span>
                </div>
            </div>

            <div className="col-12 xl:col-8">
                <div className="card">
                    <h5>{t('weekly_summary')}</h5>
                    <Chart type="line" data={lineData} options={lineOptions} />
                </div>
            </div>

            <div className="col-12 xl:col-4">
                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h5>{t('daily_tip')}</h5>
                        <Button type="button" icon="pi pi-sync" rounded text />
                    </div>
                    <div className="p-4 border-round bg-primary-reverse text-primary-contrast font-medium shadow-2" style={{lineHeight: '1.6'}}>
                        {t('daily_dental_tip_content')}
                    </div>
                    <div className="mt-4">
                         <span className="text-500 text-sm italic">* {t('brushing')} (3p), {t('flossing')} (1p), {t('mouthwash')} (1p)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;