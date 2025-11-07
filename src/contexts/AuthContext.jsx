import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../apiService';

const AuthContext = createContext(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUserString = sessionStorage.getItem('ems_user');
        if (savedUserString && savedUserString !== 'undefined') {
            try {
                setUser(JSON.parse(savedUserString));
            } catch (error) {
                console.error("Failed to parse user from sessionStorage:", error);
                sessionStorage.removeItem('ems_user');
            }
        }
        setIsLoading(false);
    }, []);

    // This new function will update the user data throughout the app
    const updateUser = (newUserData) => {
        if (newUserData) {
            setUser(newUserData);
            sessionStorage.setItem('ems_user', JSON.stringify(newUserData));
        }
    };

    const login = async (email, password, companyId) => {
        setIsLoading(true);
        try {
            const response = await apiLogin({ email, password, companyCode: companyId });
            const { token, user: userData } = response.data;
            updateUser(userData); // Use our new function
            sessionStorage.setItem('ems_token', token);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed.";
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('ems_user');
        sessionStorage.removeItem('ems_token');
    };

    const signupCompany = async (companyName, firstName, lastName, email, password) => {
        setIsLoading(true);
        try {
            await apiRegister({ companyName, firstName, lastName, email, password });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data || "Registration failed.";
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, signupCompany, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};