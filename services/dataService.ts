// services/dataService.ts

import { User, Role, Click, Conversion, Settings, Product } from '../types';

const NAMESPACE = 'affapp:';
const USERS_KEY = `${NAMESPACE}users`;
const CLICKS_KEY = `${NAMESPACE}clicks`;
const CONVERSIONS_KEY = `${NAMESPACE}conversions`;
const SETTINGS_KEY = `${NAMESPACE}settings`;
const REFERRER_KEY = `${NAMESPACE}referrer`;
const PRODUCTS_KEY = `${NAMESPACE}products`;

const pseudoHash = (password: string): string => {
    return `hashed_${password.split('').reverse().join('')}_poc`;
};

const generateDynamicSeedData = () => {
    const users: User[] = [
        { id: 'admin-01', email: 'admin@demo.com', passwordHash: pseudoHash('Admin123!'), role: Role.Admin, isActive: true },
        { id: 'ana-01', email: 'ana@demo.com', passwordHash: pseudoHash('Ana123!'), role: Role.Affiliate, isActive: true },
        { id: 'rafa-01', email: 'rafa@demo.com', passwordHash: pseudoHash('Rafa123!'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-01', email: 'carlos@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-02', email: 'beatriz@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: false },
        { id: 'afiliado-03', email: 'daniel@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-04', email: 'fernanda@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-05', email: 'gustavo@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: false },
        { id: 'afiliado-06', email: 'helena@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-07', email: 'igor@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-08', email: 'julia@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-09', email: 'lucas@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
        { id: 'afiliado-10', email: 'maria@demo.com', passwordHash: pseudoHash('senha123'), role: Role.Affiliate, isActive: true },
    ];
    
    const affiliates = users.filter(u => u.role === Role.Affiliate);
    const dynamicClicks: Record<string, any[]> = {};
    const dynamicConversions: Conversion[] = [];
    let conversionId = 1;
    const firstNames = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gisele", "Heitor", "Íris", "João", "Laura", "Marcos"];
    const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Costa"];
    const generateFakePhone = () => {
        const ddd = Math.floor(Math.random() * (99 - 11) + 11);
        const firstPart = Math.floor(Math.random() * (99999 - 90000) + 90000);
        const secondPart = Math.floor(Math.random() * 9999);
        return `(${ddd}) ${firstPart}-${secondPart.toString().padStart(4, '0')}`;
    };
    affiliates.forEach(affiliate => {
        const clickCount = Math.floor(Math.random() * 25) + 1;
        dynamicClicks[affiliate.id] = [];
        for (let i = 0; i < clickCount; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            dynamicClicks[affiliate.id].push({ timestamp: Date.now() - 86400000 * daysAgo });
        }
        const conversionRate = Math.random() * 0.5;
        const conversionCount = Math.floor(clickCount * conversionRate);
        for (let i = 0; i < conversionCount; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const productValue = parseFloat((Math.random() * 200 + 50).toFixed(2));
            const buyerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const buyerPhone = generateFakePhone();
            dynamicConversions.push({
                id: `conv-${conversionId++}`, affiliateId: affiliate.id, timestamp: Date.now() - 86400000 * daysAgo,
                productValue: productValue, commission: parseFloat((productValue * 0.10).toFixed(2)),
                buyerName: buyerName, buyerPhone: buyerPhone,
            });
        }
    });
    return {
        users, clicks: dynamicClicks, conversions: dynamicConversions,
        settings: { commissionRate: 0.10, attributionDays: 30, allowSignup: true },
        products: [
            { id: 1, name: "Produto Digital Fantástico", price: 99.90, description: "Uma solução incrível que vai revolucionar sua vida." },
            { id: 2, name: "E-book 'Segredos do Marketing'", price: 49.90, description: "Aprenda as melhores estratégias com este guia completo." },
            { id: 3, name: "Curso Online de Design Gráfico", price: 299.90, description: "Do básico ao avançado, domine as ferramentas de design." },
        ],
    };
};

class DataService {
    private _seedData() { const data = generateDynamicSeedData(); this.set(USERS_KEY, data.users); this.set(CLICKS_KEY, data.clicks); this.set(CONVERSIONS_KEY, data.conversions); this.set(SETTINGS_KEY, data.settings); this.set(PRODUCTS_KEY, data.products); }
    init() { if (!localStorage.getItem(USERS_KEY)) { this._seedData(); } }
    reset() { localStorage.removeItem(USERS_KEY); localStorage.removeItem(CLICKS_KEY); localStorage.removeItem(CONVERSIONS_KEY); localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(REFERRER_KEY); localStorage.removeItem(PRODUCTS_KEY); this._seedData(); }
    private get<T,>(key: string, defaultValue: T): T { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } catch (error) { console.error(`Error parsing localStorage key "${key}":`, error); return defaultValue; } }
    private set<T,>(key: string, value: T): void { localStorage.setItem(key, JSON.stringify(value)); }
    
    getUsers = (): User[] => this.get<User[]>(USERS_KEY, []);
    
    toggleAffiliateStatus = (userId: string) => {
        const users = this.getUsers();
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                return { ...user, isActive: !user.isActive };
            }
            return user;
        });
        this.set(USERS_KEY, updatedUsers);
    };

    addNewAffiliate = (email: string, password: string) => {
        const users = this.getUsers();
        if (users.some(u => u.email === email)) {
            throw new Error("Este email já está cadastrado.");
        }
        const newUser: User = {
            id: `affiliate-${Date.now()}`,
            email,
            passwordHash: pseudoHash(password),
            role: Role.Affiliate,
            isActive: true,
        };
        this.set(USERS_KEY, [...users, newUser]);
    };

    /**
     * Esta função é o coração da persistência de dados.
     * 1. Pega todos os usuários do localStorage.
     * 2. Encontra o usuário pelo ID e atualiza seu email e/ou senha (gerando um novo hash).
     * 3. Salva a lista inteira de usuários de volta no localStorage, sobrescrevendo a antiga.
     */
    updateAffiliateCredentials = (userId: string, newEmail: string, newPassword?: string) => {
        const users = this.getUsers();
        const updatedUsers = users.map(user => {
            if (user.id === userId) {
                const updatedUser = { ...user, email: newEmail };
                if (newPassword) {
                    updatedUser.passwordHash = pseudoHash(newPassword);
                }
                return updatedUser;
            }
            return user;
        });
        this.set(USERS_KEY, updatedUsers);
    };
    
    getClicks = (): Record<string, Click[]> => this.get<Record<string, Click[]>>(CLICKS_KEY, {});
    getConversions = (): Conversion[] => this.get<Conversion[]>(CONVERSIONS_KEY, []);
    getSettings = (): Settings => this.get<Settings>(SETTINGS_KEY, { commissionRate: 0.10, attributionDays: 30, allowSignup: true });
    getProducts = (): Product[] => this.get<Product[]>(PRODUCTS_KEY, []);
    addProduct = (product: Product): void => { const products = this.getProducts(); this.set(PRODUCTS_KEY, [...products, product]); };
    deleteProduct = (productId: number): void => { const products = this.getProducts(); this.set(PRODUCTS_KEY, products.filter(p => p.id !== productId)); };
}

export const dataService = new DataService();