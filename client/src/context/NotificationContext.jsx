import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { notification as antdNotification } from 'antd';
import { useAuth } from './AuthContext';
import {
    getMyNotificationsApi,
    getUnreadCountApi,
    markAsReadApi,
    markAllAsReadApi,
    deleteNotificationApi,
} from '../api/notification.api';

const NotificationContext = createContext();

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    // Fetch notifications from server
    const fetchNotifications = useCallback(async (params = { page: 1, limit: 15 }) => {
        if (!isAuthenticated || !user) return;
        setLoading(true);
        try {
            const res = await getMyNotificationsApi(params);
            const data = res.metadata || res;
            if (data?.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (err) {
            console.warn('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated || !user) return;
        try {
            const res = await getUnreadCountApi();
            const data = res.metadata || res;
            if (typeof data?.unreadCount === 'number') {
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.warn('Failed to fetch unread count:', err);
        }
    }, [isAuthenticated, user]);

    // Initialize Socket.IO connection when user is authenticated
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Connect to Socket.IO
        const socket = io(SOCKET_SERVER_URL, {
            query: {
                userId: user.id,
                role: user.role || 'user',
            },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('⚡ [Socket.IO Client] Connected to real-time notification server');
        });

        // Listen for user personal notifications
        socket.on('notification', (newNotif) => {
            console.log('🔔 [Socket.IO] New notification received:', newNotif);

            // Increment unread count & prepend to notification list
            setUnreadCount((prev) => prev + 1);
            setNotifications((prev) => [newNotif, ...prev]);

            // Show Ant Design floating notification popup
            const type = newNotif.type === 'error' ? 'error' : newNotif.type === 'warning' ? 'warning' : newNotif.type === 'success' ? 'success' : 'info';
            antdNotification[type]({
                message: <span className="font-extrabold text-sm">{newNotif.title}</span>,
                description: (
                    <div className="text-xs text-stone-600 leading-relaxed font-sans">
                        {newNotif.message}
                    </div>
                ),
                placement: 'topRight',
                duration: 6,
                className: 'rounded-2xl shadow-xl border border-stone-200',
            });
        });

        // Listen for admin broadcast notifications
        socket.on('admin_notification', (adminNotif) => {
            console.log('🛡️ [Socket.IO] Admin alert received:', adminNotif);
            if (user.role === 'admin' || user.role === 'superadmin') {
                setUnreadCount((prev) => prev + 1);
                setNotifications((prev) => [adminNotif, ...prev]);

                antdNotification.info({
                    message: <span className="font-extrabold text-sm text-amber-700">{adminNotif.title}</span>,
                    description: (
                        <div className="text-xs text-stone-700 leading-relaxed font-sans">
                            {adminNotif.message}
                        </div>
                    ),
                    placement: 'topRight',
                    duration: 6,
                    className: 'rounded-2xl shadow-xl border border-amber-300 bg-amber-50/50',
                });
            }
        });

        // Initial fetch on mount
        fetchNotifications();

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, user?.id, user?.role, fetchNotifications]);

    // Mark single notification as read
    const markAsRead = async (id) => {
        try {
            await markAsReadApi(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.warn('Failed to mark notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await markAllAsReadApi();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.warn('Failed to mark all as read:', err);
        }
    };

    // Delete single notification
    const deleteNotification = async (id) => {
        try {
            await deleteNotificationApi(id);
            setNotifications((prev) => {
                const target = prev.find((n) => n.id === id);
                if (target && !target.isRead) {
                    setUnreadCount((c) => Math.max(0, c - 1));
                }
                return prev.filter((n) => n.id !== id);
            });
        } catch (err) {
            console.warn('Failed to delete notification:', err);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                socket: socketRef.current,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
