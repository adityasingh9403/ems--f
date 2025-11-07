import React, { createContext, useContext, useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'; // LogLevel ko import karein
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [updateCounter, setUpdateCounter] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const hubUrl = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/notificationHub`;

        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => sessionStorage.getItem('ems_token')
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information) // <-- DEBUGGING KE LIYE YEH LINE ADD KAREIN
            .build();

        connection.on("ReceiveNotification", (message) => {
            // Jab server se signal aayega, yeh console mein dikhega
            console.log(`%c[SignalR] Notification Received: ${message}`, 'color: #14b8a6; font-weight: bold;');
            setUpdateCounter(c => c + 1); 
        });

        connection.start()
            .then(() => {
                // Connection safal hone par console mein message dikhayein
                console.log('%c[SignalR] Notification Hub Connected Successfully!', 'color: #16a34a; font-weight: bold;');
            })
            .catch(err => console.error('[SignalR] Connection Error: ', err));

        return () => {
            connection.stop();
        };

    }, [user]);

    return (
        <NotificationContext.Provider value={{ updateCounter }}>
            {children}
        </NotificationContext.Provider>
    );
};
