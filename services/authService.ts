import * as db from './db';
import { User } from '../types';

const SESSION_KEY = 'vta_session_userId';

// NOTE: In a real-world application, never store plain text passwords.
// This would be replaced with a secure backend that handles hashing and salting.
// This is for demonstration purposes in a frontend-only environment.

export const register = async (email: string, password: string): Promise<User> => {
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    const newUser = await db.addUser({ email, passwordHash: password }); // Storing password directly for demo
    
    sessionStorage.setItem(SESSION_KEY, newUser.id.toString());
    return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
    const user = await db.getUserByEmail(email);
    if (!user) {
        throw new Error('No account found with this email.');
    }

    if (user.passwordHash !== password) { // Direct comparison for demo
        throw new Error('Incorrect password.');
    }

    sessionStorage.setItem(SESSION_KEY, user.id.toString());
    return user;
};

export const logout = (): void => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const userIdStr = sessionStorage.getItem(SESSION_KEY);
        if (!userIdStr) {
            return null;
        }
        const userId = parseInt(userIdStr, 10);
        const user = await db.getUserById(userId);
        return user || null;
    } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
    }
};