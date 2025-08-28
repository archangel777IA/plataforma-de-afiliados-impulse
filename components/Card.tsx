// components/Card.tsx

import React, { ReactNode } from 'react';

interface CardProps {
    title: string;
    children: ReactNode;
    className?: string;
    // --- NOVAS PROPRIEDADES PARA O CONTROLE COLAPSÁVEL ---
    isOpen: boolean;      // Recebe se o card deve estar aberto ou fechado
    onToggle: () => void; // Recebe a função a ser chamada no clique
}

const Card: React.FC<CardProps> = ({ title, children, className = '', isOpen, onToggle }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${className}`}>
            {/* O header agora é um botão para ser clicável e acessível */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 text-left"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">{title}</h3>
                {/* Ícone de "chavinha" (seta) que gira com base no estado 'isOpen' */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {/* O conteúdo (children) só é renderizado se 'isOpen' for verdadeiro */}
            {isOpen && (
                <div className="p-4 sm:p-6">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Card;