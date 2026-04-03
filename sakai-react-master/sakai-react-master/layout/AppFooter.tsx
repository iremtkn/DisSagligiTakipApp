/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { useTranslation } from 'react-i18next';

const AppFooter = () => {
    const { t } = useTranslation();
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Logo" height="20" className="mr-2" />
            <span className="font-medium ml-2">© 2026 {t('footer_text')}</span>
        </div>
    );
};

export default AppFooter;
