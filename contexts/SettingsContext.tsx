import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Settings } from '../types';
import { dataService } from '../services/dataService';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

// Valores padrão de fallback, caso nada seja encontrado no localStorage
const defaultSettings: Settings = {
    commissionRate: 0.10,
    attributionDays: 30,
    allowSignup: true,
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    updateSettings: () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Inicializa o estado com os dados do dataService, usando o defaultSettings como fallback seguro.
    const [settings, setSettings] = useState<Settings>(() => dataService.getSettings() || defaultSettings);

    // O useEffect agora é desnecessário, pois a inicialização já é feita no useState.
    // Isso evita uma renderização extra e possíveis condições de corrida.

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prevSettings => {
            const updated = { ...prevSettings, ...newSettings };
            dataService.saveSettings(updated);
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    return useContext(SettingsContext);
};