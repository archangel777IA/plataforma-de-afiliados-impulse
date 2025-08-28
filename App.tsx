import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AffiliateDashboard from './pages/AffiliateDashboard';
import ProductPage from './pages/ProductPage';
import { trackReferral } from './services/affiliateService';
import { Role } from './types';
import Header from './components/Header';
import { dataService } from './services/dataService';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [currentPage, setCurrentPage] = useState<'product' | 'dashboard'>('dashboard');
    const [authView, setAuthView] = useState<'welcome' | 'login'>('welcome');

    useEffect(() => { dataService.init(); }, []);
    useEffect(() => { trackReferral(); }, []);
    
    const handleResetData = useCallback(() => {
        if (window.confirm("Você tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.")) {
            dataService.reset();
            window.location.reload();
        }
    }, []);

    if (loading) { return <div className="flex items-center justify-center h-screen">Carregando...</div>; }
    
    if (!user) {
        // ... (lógica de login permanece inalterada)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4">
                <div className="mb-8 text-center">
                    <img src="/logo.png" alt="Logo Do Outro Lado do Espelho" className="w-64 h-auto mb-2 mx-auto" />
                    <img src="/logo_secundario.png" alt="Logo secundário" className="w-52 h-auto mx-auto" />
                </div>
                {authView === 'welcome' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                        <a href="#" className="w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">treinamento IA</a>
                        <button onClick={() => setAuthView('login')} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">login</button>
                    </div>
                ) : (
                    <div className="w-full max-w-md">
                       <LoginPage onGoBack={() => setAuthView('welcome')} />
                    </div>
                )}
            </div>
        );
    }
    
    const renderDashboard = () => {
        switch (user.role) {
            case Role.Admin: return <AdminDashboard />;
            case Role.Affiliate: return <AffiliateDashboard />;
            default: return <div>Papel de usuário desconhecido.</div>;
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Header setCurrentPage={setCurrentPage} />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* LÓGICA DE RENDERIZAÇÃO ATUALIZADA */}
                {currentPage === 'dashboard' 
                    ? renderDashboard() 
                    : <ProductPage onGoBack={() => setCurrentPage('dashboard')} />
                }
                 <div className="mt-12 text-center">
                    <button onClick={handleResetData} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">Resetar Dados</button>
                    <p className="text-xs text-black dark:text-gray-400 mt-2">Use para reiniciar a PoC com os dados iniciais.</p>
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <DataProvider>
                <AuthProvider><AppContent /></AuthProvider>
            </DataProvider>
        </SettingsProvider>
    );
};

export default App;