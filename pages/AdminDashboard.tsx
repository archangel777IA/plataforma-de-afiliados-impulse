// pages/AdminDashboard.tsx

import React, { useMemo, useState, useRef, useEffect, FormEvent } from 'react';
import Card from '../components/Card';
import { useData } from '../contexts/DataContext';
import { User, Role } from '../types';
import { dataService } from '../services/dataService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
    const { users, clicks, conversions, refreshData } = useData();
    
    const [openSections, setOpenSections] = useState({
        desempenho: true,
        metricas: false,
        plataforma: true,
        afiliados: false,
    });
    
    const [newAffiliateEmail, setNewAffiliateEmail] = useState('');
    const [newAffiliatePassword, setNewAffiliatePassword] = useState('');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<User | null>(null);
    const [modalEmail, setModalEmail] = useState('');
    const [modalPassword, setModalPassword] = useState('');
    
    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterRef]);

    const handleToggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const affiliates = users.filter(u => u.role === Role.Affiliate);
    const lineColors = ['#dc2626', '#2563eb', '#16a34a', '#f97316', '#9333ea', '#64748b', '#ca8a04', '#db2777', '#0e7490', '#be185d', '#059669', '#854d0e'];

    const getAffiliateStats = (affiliateId: string) => {
        const affiliateClicks = (clicks[affiliateId] as any[])?.length || 0;
        const affiliateConversions = conversions.filter(c => c.affiliateId === affiliateId);
        const totalCommission = affiliateConversions.reduce((sum, conv) => sum + conv.commission, 0);
        return { clicks: affiliateClicks, conversions: affiliateConversions.length, commission: totalCommission };
    };
    
    const chartData = useMemo(() => {
        const allDates=[...new Set(conversions.map(c=>new Date(c.timestamp).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})))];const sortedLabels=allDates.sort((a,b)=>{const[dayA,monthA]=a.split('/').map(Number);const[dayB,monthB]=b.split('/').map(Number);return new Date(2024,monthA-1,dayA).getTime()-new Date(2024,monthB-1,dayB).getTime()});const salesByAffiliate:Record<string,Record<string,number>>={};conversions.forEach(conv=>{const date=new Date(conv.timestamp).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});if(!salesByAffiliate[conv.affiliateId]){salesByAffiliate[conv.affiliateId]={}};if(!salesByAffiliate[conv.affiliateId][date]){salesByAffiliate[conv.affiliateId][date]=0};salesByAffiliate[conv.affiliateId][date]+=conv.productValue});let datasets=affiliates.map((affiliate,index)=>{const affiliateSales=salesByAffiliate[affiliate.id]||{};return{id:affiliate.id,label:affiliate.email,data:sortedLabels.map(label=>affiliateSales[label]||0),borderColor:lineColors[index%lineColors.length],backgroundColor:lineColors[index%lineColors.length]+'80',tension:0.1}});if(selectedAffiliateId!=='all'){datasets=datasets.filter(ds=>ds.id===selectedAffiliateId)}return{labels:sortedLabels,datasets:datasets}},[conversions,affiliates,selectedAffiliateId]);
    const chartOptions = { responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Faturamento de Vendas por Afiliado' } }, scales: { y: { beginAtZero: true, ticks: { callback: function(value: string | number) { return 'R$ ' + value; } } } } };
    
    const handleFilterSelect = (id: string) => { setSelectedAffiliateId(id); setIsFilterOpen(false); };
    const selectedAffiliateEmail = affiliates.find(a => a.id === selectedAffiliateId)?.email || 'Todos os Afiliados';

    const openEditModal = (affiliate: User) => {
        setEditingAffiliate(affiliate);
        setModalEmail(affiliate.email);
        setModalPassword('');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingAffiliate(null);
    };

    /**
     * Esta função é o gatilho da UI.
     * 1. Pega os dados do formulário do modal.
     * 2. Chama a função do dataService para salvar permanentemente no localStorage.
     * 3. Chama refreshData() para atualizar a tela com os novos dados.
     */
    const handleSaveChanges = (e: FormEvent) => {
        e.preventDefault();
        if (!editingAffiliate || !modalEmail) return;
        
        dataService.updateAffiliateCredentials(editingAffiliate.id, modalEmail, modalPassword || undefined);
        refreshData();
        closeEditModal();
    };

    const handleToggleStatus = (userId: string) => { dataService.toggleAffiliateStatus(userId); refreshData(); };
    const handleAddAffiliate = (e: FormEvent) => {
        e.preventDefault();
        if (!newAffiliateEmail || !newAffiliatePassword) { alert("Por favor, preencha email e senha."); return; }
        try {
            dataService.addNewAffiliate(newAffiliateEmail, newAffiliatePassword);
            refreshData();
            setNewAffiliateEmail('');
            setNewAffiliatePassword('');
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Painel do Administrador</h2>
                
                <Card title="Desempenho de Vendas" isOpen={openSections.desempenho} onToggle={() => handleToggleSection('desempenho')}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-black dark:text-gray-300 mb-1">Filtrar por Afiliado</label>
                        <div className="relative w-full max-w-xs" ref={filterRef}>
                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <span>{selectedAffiliateEmail}</span>
                                <svg className={`h-5 w-5 text-gray-400 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            {isFilterOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    <button onClick={() => handleFilterSelect('all')} className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Todos os Afiliados</button>
                                    {affiliates.map((affiliate, index) => (
                                        <button key={affiliate.id} onClick={() => handleFilterSelect(affiliate.id)} className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: lineColors[index % lineColors.length] }}></span>
                                            {affiliate.email}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <Line options={chartOptions} data={chartData} />
                </Card>

                <Card title="Métricas Gerais" isOpen={openSections.metricas} onToggle={() => handleToggleSection('metricas')}>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-3xl font-semibold">{users.length}</p>
                            <p className="text-sm text-black dark:text-gray-400">Total de Usuários</p>
                        </div>
                        <div>
                            <p className="text-3xl font-semibold">{Object.values(clicks).flat().length}</p>
                            <p className="text-sm text-black dark:text-gray-400">Total de Cliques</p>
                        </div>
                        <div>
                            <p className="text-3xl font-semibold">{conversions.length}</p>
                            <p className="text-sm text-black dark:text-gray-400">Total de Conversões</p>
                        </div>
                    </div>
                </Card>

                <Card title="Configurações de Plataforma" isOpen={openSections.plataforma} onToggle={() => handleToggleSection('plataforma')}>
                    <div>
                        <h4 className="text-lg font-semibold text-black dark:text-white mb-4">Gerenciar Cadastros de Afiliados</h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {affiliates.map(affiliate => (
                                <div key={affiliate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="font-medium text-black dark:text-white">{affiliate.email}</p>
                                        <p className={`text-xs font-medium ${affiliate.isActive ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>Status: {affiliate.isActive ? 'Ativo' : 'Inativo'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleStatus(affiliate.id)} className={`px-3 py-1 text-sm font-semibold rounded-md transition ${affiliate.isActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                            {affiliate.isActive ? 'Desativar' : 'Ativar'}
                                        </button>
                                        <button onClick={() => openEditModal(affiliate)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Editar credenciais">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-black dark:text-white mb-4">Cadastrar Novo Afiliado</h4>
                        <form onSubmit={handleAddAffiliate} className="space-y-4">
                            <div>
                                <label htmlFor="newAffiliateEmail" className="block text-sm font-medium text-black dark:text-gray-200">Email do Novo Afiliado</label>
                                <input type="email" id="newAffiliateEmail" value={newAffiliateEmail} onChange={(e) => setNewAffiliateEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="newAffiliatePassword" className="block text-sm font-medium text-black dark:text-gray-200">Senha Provisória</label>
                                <input type="password" id="newAffiliatePassword" value={newAffiliatePassword} onChange={(e) => setNewAffiliatePassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                            </div>
                            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                                Cadastrar Afiliado
                            </button>
                        </form>
                    </div>
                </Card>

                <Card title="Afiliados" isOpen={openSections.afiliados} onToggle={() => handleToggleSection('afiliados')}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {affiliates.map((affiliate) => {
                            const stats = getAffiliateStats(affiliate.id);
                            const conversionRate = stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0;
                            const avgCommission = stats.conversions > 0 ? stats.commission / stats.conversions : 0;
                            const hasCoupon = affiliate.id.includes('ana') || affiliate.id.includes('rafa') || parseInt(affiliate.id.slice(-2)) % 2 !== 0;
                            return (
                                <div key={affiliate.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold text-black dark:text-white truncate" title={affiliate.email}>{affiliate.email}</h4>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${hasCoupon ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>Cupom {hasCoupon ? 'Ativo' : 'Inativo'}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                            <div>
                                                <p className={`text-2xl font-semibold ${stats.clicks > 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>{stats.clicks}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Cliques</p>
                                            </div>
                                            <div>
                                                <p className={`text-2xl font-semibold ${stats.conversions > 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>{stats.conversions}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Vendas</p>
                                            </div>
                                            <div>
                                                <p className={`text-2xl font-semibold ${stats.commission > 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>{stats.commission.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Comissão (R$)</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-sm space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-300">Taxa de Conversão:</span>
                                                <span className={`font-medium ${conversionRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>{conversionRate.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-300">Comissão Média/Venda:</span>
                                                <span className={`font-medium ${avgCommission > 0 ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>R$ {avgCommission.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {isEditModalOpen && editingAffiliate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-black dark:text-white">Gerenciar Afiliado</h3>
                            <button onClick={closeEditModal} className="p-1 rounded-full text-2xl text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                        </div>
                        <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="modalEmail" className="block text-sm font-medium text-black dark:text-gray-200">Email de Login</label>
                                <input type="email" id="modalEmail" value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="modalPassword" className="block text-sm font-medium text-black dark:text-gray-200">Nova Senha (Opcional)</label>
                                <input type="password" id="modalPassword" value={modalPassword} onChange={(e) => setModalPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"/>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-black dark:text-white transition">Cancelar</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary-600 hover:bg-primary-700 text-white transition">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;