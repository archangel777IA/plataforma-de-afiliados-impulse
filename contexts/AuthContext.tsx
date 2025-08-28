// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService'; 

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mesma função de hash do dataService para garantir que a comparação funcione.
const pseudoHash = (password: string): string => {
    return `hashed_${password.split('').reverse().join('')}_poc`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        await new Promise(res => setTimeout(res, 500)); 

        const users = dataService.getUsers();
        const foundUser = users.find(u => u.email === email);

        // LÓGICA DE COMPARAÇÃO CORRIGIDA
        // Comparamos o hash da senha digitada com o hash armazenado.
        if (foundUser && foundUser.passwordHash === pseudoHash(password)) {
            const userToStore: Partial<User> = { ...foundUser };
            delete userToStore.passwordHash; // Nunca guardamos senhas ou hashes no localStorage da sessão
            
            localStorage.setItem('user', JSON.stringify(userToStore));
            setUser(foundUser);
        } else {
            throw new Error('Email ou senha inválidos.');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};