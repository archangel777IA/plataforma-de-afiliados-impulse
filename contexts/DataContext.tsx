import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { User, Click, Conversion } from '../types';
import { dataService } from '../services/dataService';

interface DataContextType {
    users: User[];
    clicks: Record<string, Click[]>;
    conversions: Conversion[];
    refreshData: () => void;
    updateUser: (user: User) => void;
    addUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    addConversion: (conversion: Conversion) => void;
    addClick: (affiliateId: string, click: Click) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [clicks, setClicks] = useState<Record<string, Click[]>>({});
    const [conversions, setConversions] = useState<Conversion[]>([]);

    const refreshData = useCallback(() => {
        setUsers(dataService.getUsers());
        setClicks(dataService.getClicks());
        setConversions(dataService.getConversions());
    }, []);

    useEffect(() => {
        // A CHAMADA dataService.init() FOI REMOVIDA DAQUI
        // A inicialização agora é responsabilidade exclusiva do App.tsx.
        refreshData();
    }, [refreshData]);

    const updateUser = (user: User) => {
        dataService.updateUser(user);
        refreshData();
    };
    
    const addUser = (user: User) => {
        dataService.addUser(user);
        refreshData();
    };

    const deleteUser = (userId: string) => {
        dataService.deleteUser(userId);
        refreshData();
    };
    
    const addConversion = (conversion: Conversion) => {
        dataService.addConversion(conversion);
        refreshData();
    };

    const addClick = (affiliateId: string, click: Click) => {
        dataService.addClick(affiliateId, click);
        refreshData();
    };

    return (
        <DataContext.Provider value={{ users, clicks, conversions, refreshData, updateUser, addUser, deleteUser, addConversion, addClick }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};