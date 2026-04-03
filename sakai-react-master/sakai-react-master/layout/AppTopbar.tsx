/* eslint-disable @next/next/no-img-element */
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Calendar } from 'primereact/calendar';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { t, i18n } = useTranslation();
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const op = useRef<OverlayPanel>(null); 
    const [date, setDate] = useState<Date | null>(new Date());

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>DentalCare</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                
                <div className="flex align-items-center gap-2 mr-3 border-right-1 surface-border pr-3 ml-3">
                <button 
                  type="button" 
                  className={`p-link font-medium ${i18n.language === 'tr' ? 'text-primary font-bold' : 'text-600'}`} 
                  onClick={() => i18n.changeLanguage('tr')}>
                  TR
                </button>
                <span className="text-400">|</span>
                <button 
                  type="button" 
                  className={`p-link font-medium ${i18n.language === 'en' ? 'text-primary font-bold' : 'text-600'}`} 
                  onClick={() => i18n.changeLanguage('en')}>
                  EN
                </button>
                <span className='text-400'>|</span>
                <button 
                  type="button" 
                  className={`p-link font-medium ${i18n.language === 'de' ? 'text-primary font-bold' : 'text-600'}`} 
                  onClick={() => i18n.changeLanguage('de')}>
                  DE
                </button>
                </div>
                
                <button type="button" className="p-link layout-topbar-button" onClick={(e) => op.current?.toggle(e)}>
                    <i className="pi pi-calendar"></i>
                    <span>{t('calendar') || 'Calendar'}</span>
                </button>

                <OverlayPanel ref={op} appendTo={typeof window !== 'undefined' ? document.body : undefined}>
                    <Calendar 
                        value={date} 
                        onChange={(e) => {
                            setDate(e.value as Date);
                            op.current?.hide();
                        }} 
                        inline 
                        showWeek 
                    />
                </OverlayPanel>

                <Link href="/profile">
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-user"></i>
                        <span>{t('profile') || 'Profile'}</span>
                    </button>
                </Link>

                <button 
                    type="button" 
                    className="p-link layout-topbar-button" 
                    onClick={() => {
                        const configButton = document.querySelector('.layout-config-button') as HTMLElement;
                        if (configButton) configButton.click();
                    }}
                >
                    <i className="pi pi-cog"></i>
                    <span>{t('settings')}</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;