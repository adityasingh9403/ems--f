import React, { createContext, useContext, useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { apiGetNotifications } from '../apiService'; // API call ko yahaan le aayein

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();

    // Purane 'updateCounter' ke bajaye ab hum asli state manage karenge
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewChat, setHasNewChat] = useState(false);

    // Initial notifications fetch karne ke liye function
    const fetchInitialNotifications = async () => {
        try {
            const response = await apiGetNotifications();
            const notificationsData = response.data?.$values || [];
            setNotifications(notificationsData.slice(0, 10)); // Sirf latest 10 dikhayein

            // Yahaan hum "unread" count calculate kar sakte hain
            // Abhi ke liye, hum maan lete hain ki saari nayi notifications unread hain
            // TODO: Backend mein 'isRead' flag add karein
            setUnreadCount(notificationsData.length);
        } catch (error) {
            console.error("Failed to fetch initial notifications:", error);
        }
    };

    useEffect(() => {
        if (!user) return;

        // 1. App load hote hi purani notifications fetch karein
        fetchInitialNotifications();

        // 2. SignalR connection banayein
        const hubUrl = `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/notificationHub`;

        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => sessionStorage.getItem('ems_token')
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // 3. SignalR se aane wale messages ko sunein
        connection.on("ReceiveNotification", (messageType) => {
            console.log(`[SignalR] Naya Signal Aaya: ${messageType}`);

            if (messageType === "NewChatMessage") {
                // Agar naya chat message hai, toh 'hasNewChat' ko true set karein
                setHasNewChat(true);
            } else {
                // Agar koi aur update hai (Leave, Task, etc.)
                // Toh bell icon ke liye naye notifications fetch karein
                setUnreadCount(prevCount => prevCount + 1); // Counter badhayein
                fetchInitialNotifications(); // List ko refresh karein
            }
        });

        // 4. Connection start karein
        connection.start()
            .then(() => {
                console.log('%c[SignalR] Notification Hub Connected Successfully!', 'color: #16a34a; font-weight: bold;');
            })
            .catch(err => console.error('[SignalR] Connection Error: ', err));

        // 5. Cleanup
        return () => {
            connection.stop();
        };

    }, [user]);

    // Bell icon par click karne par yeh function call hoga
    const markAsRead = () => {
        setUnreadCount(0);
        // TODO: Yahaan ek API call add kar sakte hain jo backend mein notifications ko 'read' mark kare
    };

    // Chat icon par click karne par yeh function call hoga
    const clearChatNotification = () => {
        setHasNewChat(false);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            hasNewChat,
            markAsRead,
            clearChatNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};