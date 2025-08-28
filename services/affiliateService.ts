
import { dataService } from './dataService';
import { ReferrerInfo } from '../types';

const getReferrer = (): ReferrerInfo | null => {
    const refInfo = dataService.getReferrer();
    if (!refInfo) return null;

    const { attributionDays } = dataService.getSettings();
    const attributionWindowMs = attributionDays * 24 * 60 * 60 * 1000;
    
    if (Date.now() - refInfo.timestamp > attributionWindowMs) {
        // Referrer expired
        dataService.setReferrer(null);
        return null;
    }
    
    return refInfo;
};

export const trackReferral = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');

    if (refId) {
        const users = dataService.getUsersMap();
        if (users[refId]) {
            // Store referrer info and record a click
            dataService.setReferrer({ refId, timestamp: Date.now() });
            dataService.addClick(refId, {
                timestamp: Date.now(),
                userAgent: navigator.userAgent.substring(0, 100), // Simple user agent
            });

            // Clean URL to prevent re-tracking on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
};

export const recordConversion = (productValue: number): { success: boolean, message: string } => {
    const referrer = getReferrer();
    if (!referrer) {
        return { success: false, message: "Nenhum afiliado ativo para atribuir a conversão." };
    }

    const { commissionRate } = dataService.getSettings();
    const commission = productValue * commissionRate;

    dataService.addConversion({
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        affiliateId: referrer.refId,
        timestamp: Date.now(),
        productValue,
        commission,
    });
    
    const affiliate = dataService.getUsersMap()[referrer.refId];

    return { success: true, message: `Conversão de R$ ${productValue.toFixed(2)} registrada para o afiliado ${affiliate?.email || 'desconhecido'}!` };
};
