'use client';
import { PrimeReactProvider } from 'primereact/api';
import { LayoutProvider } from './layoutcontext';
import { AuthProvider } from './AuthContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <PrimeReactProvider>
            <LayoutProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </LayoutProvider>
        </PrimeReactProvider>
    );
}