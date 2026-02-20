import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import API from '../api/axios';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    avatar?: string;
    location?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('scrappy_token');
        const storedUser = localStorage.getItem('scrappy_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await API.post('/api/auth/login', { email, password });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('scrappy_token', data.token);
        localStorage.setItem('scrappy_user', JSON.stringify(data.user));
    };

    const register = async (name: string, email: string, password: string, role: string) => {
        const { data } = await API.post('/api/auth/register', { name, email, password, role });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('scrappy_token', data.token);
        localStorage.setItem('scrappy_user', JSON.stringify(data.user));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('scrappy_token');
        localStorage.removeItem('scrappy_user');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('scrappy_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export default AuthContext;
