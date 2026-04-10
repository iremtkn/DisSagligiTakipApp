'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username?: string; 
}

interface AuthContextType {
    user: User | null;
    login:      (user: User) => void;
    logout:     () => void;
    updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
    user:       null,
    login:      () => {},
    logout:     () => {},
    updateUser: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('currentUser');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('currentUser');
    };

    const updateUser = (updated: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...updated };
        setUser(newUser);
        sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);