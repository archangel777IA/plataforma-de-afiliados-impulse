// types.ts

export enum Role {
    Admin = 'admin',
    Affiliate = 'affiliate'
}

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean; // --- NOVO CAMPO PARA STATUS DE ATIVAÇÃO ---
}

export interface Click {
    id: string;
    affiliateId: string;
    timestamp: number;
}

export interface Conversion {
    id: string;
    affiliateId: string;
    timestamp: number;
    productValue: number;
    commission: number;
    buyerName: string;
    buyerPhone: string;
}

export interface Settings {
    commissionRate: number;
    attributionDays: number;
    allowSignup: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
}