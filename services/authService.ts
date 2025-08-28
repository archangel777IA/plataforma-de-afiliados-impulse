
import { User } from '../types';
import { dataService } from './dataService';

const SESSION_KEY = 'affapp:session';
const LOGIN_ATTEMPTS_KEY = 'affapp:loginAttempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 1000; // 30 seconds

// SIMULATED password hashing. DO NOT USE IN PRODUCTION.
// This must match the hashing in dataService.
const pseudoHash = (password: string): string => {
    return `hashed_${password.split('').reverse().join('')}_poc`;
};

const getLoginAttempts = (): { count: number; lockoutUntil: number } => {
    const attempts = sessionStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return attempts ? JSON.parse(attempts) : { count: 0, lockoutUntil: 0 };
};

const setLoginAttempts = (count: number, lockoutUntil: number) => {
    sessionStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count, lockoutUntil }));
};

class AuthService {
    login = async (email: string, password: string): Promise<User | null> => {
        const attempts = getLoginAttempts();

        if (Date.now() < attempts.lockoutUntil) {
            throw new Error(`Muitas tentativas de login. Tente novamente em ${Math.ceil((attempts.lockoutUntil - Date.now()) / 1000)} segundos.`);
        }

        const users = dataService.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.passwordHash === pseudoHash(password)) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            setLoginAttempts(0, 0); // Reset on success
            return user;
        } else {
            const newCount = attempts.count + 1;
            if (newCount >= MAX_ATTEMPTS) {
                setLoginAttempts(newCount, Date.now() + LOCKOUT_DURATION);
                throw new Error('Credenciais inválidas. Sua conta foi bloqueada por 30 segundos.');
            } else {
                setLoginAttempts(newCount, 0);
                throw new Error('Credenciais inválidas.');
            }
        }
    };

    logout = (): void => {
        sessionStorage.removeItem(SESSION_KEY);
    };

    getCurrentUser = (): User | null => {
        try {
            const userJson = sessionStorage.getItem(SESSION_KEY);
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            return null;
        }
    };
}

export const authService = new AuthService();
