import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Conversion } from '../types';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard: React.FC<{ title: string; value: string | number; description: string; }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-md">
        <h4 className="text-sm font-medium text-black dark:text-gray-400 uppercase tracking-wider">{title}</h4>
        <p className="mt-1 text-3xl font-semibold text-black dark:text-white">{value}</p>
        <p className="mt-1 text-sm text-black dark:text-gray-400">{description}</p>
    </div>
);

const AffiliateDashboard: React.FC = () => {
    const { user } = useAuth();
    const { clicks, conversions } = useData();
    const [linkCopied, setLinkCopied] = useState(false);

    const [openSections, setOpenSections] = useState({
        affiliateLink: true,
        performanceChart: true,
        latestActivities: true,
    });

    const handleToggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const affiliateId = user?.id || '';
    const referralLink = `${window.location.origin}${window.location.pathname}?ref=${affiliateId}`;

    const stats = useMemo(() => {
        const userClicks = (clicks[affiliateId] as any[])?.length || 0;
        const userConversions = conversions.filter(c => c.affiliateId === affiliateId);
        const totalCommission = userConversions.reduce((acc, c) => acc + c.commission, 0);
        return {
            clickCount: userClicks,
            conversionCount: userConversions.length,
            totalCommission,
            conversions: userConversions.sort((a,b) => b.timestamp - a.timestamp)
        };
    }, [affiliateId, clicks, conversions]);

    const monthlyChartData = useMemo(() => {
        const salesGoal = 10;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        const affiliateConversions = conversions.filter(c => c.affiliateId === affiliateId);
        
        const monthlyConversions = affiliateConversions.filter(c => {
            const convDate = new Date(c.timestamp);
            return convDate.getMonth() === currentMonth && convDate.getFullYear() === currentYear;
        });

        const salesByDay: Record<number, number> = {};
        monthlyConversions.forEach(conv => {
            const day = new Date(conv.timestamp).getDate();
            salesByDay[day] = (salesByDay[day] || 0) + 1;
        });

        const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
        const cumulativeData: number[] = [];
        let cumulativeSales = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            cumulativeSales += salesByDay[i] || 0;
            cumulativeData.push(cumulativeSales);
        }

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Vendas Acumuladas no Mês',
                    data: cumulativeData,
                    borderColor: '#2563eb',
                    backgroundColor: '#2563eb33',
                    fill: true,
                    tension: 0.2,
                },
                {
                    label: 'Meta de Vendas',
                    data: Array(daysInMonth).fill(salesGoal),
                    borderColor: '#dc2626',
                    borderDash: [5, 5],
                    pointRadius: 0,
                },
            ],
        };
    }, [conversions, affiliateId]);

    const monthlyChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Progresso para a Meta de ${10} Vendas Mensais` },
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 12,
                ticks: { stepSize: 1 }
            },
            x: {
                title: { display: true, text: 'Dias do Mês' }
            }
        },
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white">Seu Painel de Afiliado</h2>
            
            <Card title="Seu Link de Afiliado" isOpen={openSections.affiliateLink} onToggle={() => handleToggleSection('affiliateLink')}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <input type="text" readOnly value={referralLink} className="flex-grow w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-black dark:text-white focus:outline-none sm:text-sm"/>
                    <button onClick={handleCopyLink} className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">{linkCopied ? 'Copiado!' : 'Copiar Link'}</button>
                </div>
                <p className="mt-2 text-sm text-black dark:text-gray-400">Compartilhe este link para rastrear cliques e conversões.</p>
            </Card>

            <Card title="Meta de Vendas Mensais" isOpen={openSections.performanceChart} onToggle={() => handleToggleSection('performanceChart')}>
                <Line options={monthlyChartOptions} data={monthlyChartData} />
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Cliques" value={stats.clickCount} description="Total de cliques no seu link." />
                <StatCard title="Conversões" value={stats.conversionCount} description="Vendas geradas pelo seu link." />
                <StatCard title="Comissão Total" value={`R$ ${stats.totalCommission.toFixed(2)}`} description="Sua receita total." />
            </div>

            <Card title="Últimas Atividades" isOpen={openSections.latestActivities} onToggle={() => handleToggleSection('latestActivities')}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-900">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider">Comprador</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider">Contato (WhatsApp)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider">Data</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider">Valor da Venda</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-gray-300 uppercase tracking-wider">Sua Comissão</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                           {stats.conversions.length > 0 ? (
                                stats.conversions.map((conv: Conversion) => (
                                    <tr key={conv.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{conv.buyerName || '--'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{conv.buyerPhone ? (<a href={`https://wa.me/55${conv.buyerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{conv.buyerPhone}</a>) : ('--')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">{new Date(conv.timestamp).toLocaleString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-100">R$ {conv.productValue.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">+ R$ {conv.commission.toFixed(2)}</td>
                                    </tr>
                                ))
                           ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma atividade registrada ainda.</td>
                                </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AffiliateDashboard;