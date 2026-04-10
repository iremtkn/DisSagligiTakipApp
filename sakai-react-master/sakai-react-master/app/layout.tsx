/* layout.tsx */
import ClientProviders from '../layout/context/ClientProviders';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

export const metadata = {
    title: 'Dental App',
    description: 'Dental Health App',
    manifest: '/manifest.json',
    themeColor: '#2196F3'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}