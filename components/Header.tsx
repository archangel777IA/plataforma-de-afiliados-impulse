import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface HeaderProps {
    setCurrentPage: (page: 'dashboard' | 'product') => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage }) => {
    const { user, logout } = useAuth();

    if (!user) return null;
    
    const roleName = user.role === Role.Admin ? 'Admin' : 'Afiliado';

    return (
        // COR ALTERADA: Fundo do header para branco/preto com uma borda sutil
        <header className="bg-white dark:bg-black shadow-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        {/* A classe 'text-primary-*' já foi atualizada para vermelho no index.html */}
                        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Sistema de Afiliados</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <nav className="hidden md:flex space-x-4">
                            {/* COR ALTERADA: Texto dos botões de navegação */}
                            <button onClick={() => setCurrentPage('dashboard')} className="text-black dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition">Dashboard</button>
                            <button onClick={() => setCurrentPage('product')} className="text-black dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition">Produto</button>
                        </nav>
                        {/* COR ALTERADA: Texto do email */}
                        <div className="text-sm text-black dark:text-gray-300">
                           <span>{user.email}</span>
                           {/* A classe 'bg-primary-*' para a tag de role já foi atualizada para vermelho */}
                           <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">{roleName}</span>
                        </div>
                        <button
                            onClick={logout}
                            // A classe 'bg-primary-*' para o botão de sair já foi atualizada para vermelho
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition duration-300"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;