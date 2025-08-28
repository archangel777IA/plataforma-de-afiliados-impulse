// pages/LoginPage.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
    onGoBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onGoBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            setLoading(false);
            return;
        }
        
        try {
            await login(email, password);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative rounded-lg shadow-lg w-full max-w-md overflow-hidden bg-[url('/login_background.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative z-10 p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white">bem vindo a impulse!</h2>
                    <p className="text-lg text-gray-400 mt-1">login</p>
                </div>

                {error && <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="mt-8">
                    {/* --- CAMPOS DE EMAIL E SENHA RESTAURADOS AQUI --- */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-200">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-200">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    {/* --- FIM DA SEÇÃO RESTAURADA --- */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button 
                        onClick={onGoBack}
                        className="text-sm text-gray-400 hover:text-white hover:underline transition-colors"
                    >
                        &larr; Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;