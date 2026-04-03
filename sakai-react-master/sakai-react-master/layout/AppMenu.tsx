/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { useTranslation } from 'react-i18next';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { t } = useTranslation();
    const model: AppMenuItem[] = [
        {
            label: t('menu_main'),
            items: [
                { 
                    label: t('menu_dashboard'), 
                    icon: 'pi pi-fw pi-home', 
                    to: '/' 
                },
                { 
                    label: t('menu_dental_health'), 
                    icon: 'pi pi-fw pi-heart', 
                    to: '/dental-health' 
                }
            ]
        },
        {
            label: t('menu_user_actions'), 
            items: [
                { 
                    label: t('menu_profile'), 
                    icon: 'pi pi-fw pi-user', 
                    to: '/profile' 
                },
                { 
                    label: t('menu_logout'), 
                    icon: 'pi pi-fw pi-sign-out', 
                    to: '/auth/login' 
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className="menu-separator"></li>
                    );
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;