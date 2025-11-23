import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { getAccessToken, getRefreshToken, setAccessToken } from '../service/storeService';
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';

const WS_CHAT = 'ws://localhost:8080/ws-chat';
const WS_NOTIFICATION = 'ws://localhost:8080/ws-notification';
const RECONNECT_DELAY = 5000;

export const StompContext = createContext(undefined);

export const StompProvider = ({ children }) => {
    const chatClientRef = useRef(null);
    const notifyClientRef = useRef(null);
    const chatSubscriptionRef = useRef(null);
    const notifySubscriptionRef = useRef(null);
    const isReconnectingRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const [chatConnected, setChatConnected] = useState(false);
    const [notifyConnected, setNotifyConnected] = useState(false);

    const { user } = useAuth();
    const { addAlert } = useAlerts();

    const reconnectWithNewToken = useCallback(async () => {
        if (isReconnectingRef.current) return;
        isReconnectingRef.current = true;

        try {
            const refresh = getRefreshToken();
            if (!refresh) return;

            const res = await axios.post("http://localhost:8080/auth/refresh", { token: refresh });

            const newAccess = res.data.data.accessToken;
            setAccessToken(newAccess);

            if (chatClientRef.current) {
                await chatClientRef.current.deactivate(); // Đợi đóng hoàn toàn
                chatClientRef.current = null;
            }

            connectChat(newAccess);

        } catch (error) {
            addAlert({
                type: "error",
                message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
            });
        } finally {
            isReconnectingRef.current = false;
        }
    }, []);


    // ===== WS CHAT =====
    const connectChat = useCallback((token) => {
        if (!user?.id) {
            console.warn('⚠️ Cannot connect chat: user.id is missing');
            return;
        }
        if (chatClientRef.current?.active) {
            console.log('ℹ️ Chat already connected');
            return;
        }

        console.log('🔌 Connecting to chat server...');

        const client = new Client({
            brokerURL: WS_CHAT,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: RECONNECT_DELAY,
            debug: () => { },
            onConnect: () => {
                console.log('✅ Chat connected');
                setChatConnected(true);

                // Unsubscribe old
                if (chatSubscriptionRef.current) {
                    try {
                        chatSubscriptionRef.current.unsubscribe();
                    } catch (e) {
                        console.warn('Failed to unsubscribe old chat subscription', e);
                    }
                }
            },

            onWebSocketError: (err) => {
                console.error('❌ Chat WS error', err);
            },
            onStompError: (frame) => {
                console.error('❌ Chat STOMP error', frame);
                const errorMsg = frame.body || '';
                console.log('errorMsg:', errorMsg);
                if (
                    errorMsg.includes('Authentication failed') ||
                    errorMsg.includes('401') ||
                    errorMsg.includes('Unauthorized') ||
                    errorMsg.includes('jwt expired') ||
                    errorMsg.includes('Invalid token') ||
                    errorMsg.includes('Lỗi đăng nhập!')
                ) {
                    console.log('🔄 Token invalid, attempting to reconnect...');
                    reconnectWithNewToken();
                }
            },
            onDisconnect: () => {
                console.log('🔌 Chat disconnected');
                setChatConnected(false);
            },
        });

        client.activate();
        chatClientRef.current = client;
    }, [user?.id, reconnectWithNewToken]);


    // ===== WS NOTIFICATION =====
    const connectNotification = useCallback(() => {
        if (!user?.id) {
            return;
        }

        if (notifyClientRef.current?.active) {
            console.log('ℹ️ Notification already connected');
            return;
        }

        const client = new Client({
            brokerURL: WS_NOTIFICATION,
            reconnectDelay: RECONNECT_DELAY,
            debug: () => { },
            onConnect: () => {
                console.log('🔔 Notification connected');
                setNotifyConnected(true);

                // Unsubscribe old subscription if exists
                if (notifySubscriptionRef.current) {
                    try {
                        notifySubscriptionRef.current.unsubscribe();
                    } catch (e) {
                        console.warn('Failed to unsubscribe old notification subscription', e);
                    }
                }

                const topic = `/topic/notification/${user.id}`;
                notifySubscriptionRef.current = client.subscribe(topic, (msg) => {
                    try {
                        const payload = msg.body ? JSON.parse(msg.body) : msg;
                        addAlert({
                            type: "info",
                            message: payload?.message || "Bạn có thông báo mới!",
                        });
                    } catch (e) {

                        addAlert({
                            type: "error",
                            message: "Đã có lỗi xảy ra khi nhận thông báo.",
                        });
                    }
                });
            },
            onWebSocketError: (err) => {
                console.error('❌ Notification WS error', err);
            },
            onStompError: (frame) => {
                console.error('❌ Notification STOMP error', frame);
            },
            onDisconnect: () => {
                console.log('🔌 Notification disconnected');
                setNotifyConnected(false);
            },
        });

        client.activate();
        notifyClientRef.current = client;
    }, [user?.id, addAlert]);

    const disconnect = useCallback(() => {
        console.log('🧹 Starting disconnect...');

        if (chatSubscriptionRef.current) {
            try {
                chatSubscriptionRef.current.unsubscribe();
            } catch (e) {
                console.warn('Failed to unsubscribe chat', e);
            }
            chatSubscriptionRef.current = null;
        }

        if (notifySubscriptionRef.current) {
            try {
                notifySubscriptionRef.current.unsubscribe();
            } catch (e) {
                console.warn('Failed to unsubscribe notification', e);
            }
            notifySubscriptionRef.current = null;
        }

        if (chatClientRef.current) {
            try {
                chatClientRef.current.deactivate();
            } catch (e) {
                console.warn('Failed to deactivate chat client', e);
            }
            chatClientRef.current = null;
        }

        if (notifyClientRef.current) {
            try {
                notifyClientRef.current.deactivate();
            } catch (e) {
                console.warn('Failed to deactivate notification client', e);
            }
            notifyClientRef.current = null;
        }

        setChatConnected(false);
        setNotifyConnected(false);
        console.log('✅ All connections closed');
    }, []);

    const sendChat = useCallback((destination, data) => {
        if (!chatClientRef.current?.connected) {
            console.warn('⚠️ Chat not connected, cannot send message');
            return false;
        }
        try {
            chatClientRef.current.publish({
                destination: destination,
                body: JSON.stringify(data),
                headers: {
                    "content-type": "application/json"
                }
            });
            return true;
        } catch (e) {
            console.error('❌ Failed to send chat message:', e);
            addAlert({
                type: "error",
                message: "Đã có lỗi xảy ra khi gửi tin nhắn.",
            });
            return false;
        }
    }, [addAlert]);

    /**
     * Gửi message đến một user cụ thể
     * @param {string} recipientId - ID của người nhận
     * @param {string} message - Nội dung tin nhắn
     * @param {object} extraData - Dữ liệu thêm (optional)
     */
    const sendMessageToUser = useCallback((recipientId, message, extraData = {}) => {
        if (!chatClientRef.current?.connected) {
            console.warn('⚠️ Chat not connected');
            return false;
        }

        // STOMP sử dụng SEND command, không cần destination cụ thể
        // Backend sẽ xử lý và route đến đúng user
        return sendChat('/app/chat', {
            to: recipientId,
            message: message,
            ...extraData
        });
    }, [sendChat]);

    const subscribeChat = useCallback((destination, callback) => {
        if (!chatClientRef.current?.connected) return null;
        try {
            return chatClientRef.current.subscribe(destination, (msg) => {
                try {
                    const payload = JSON.parse(msg.body);
                    callback(payload);
                } catch (e) {
                    console.error('❌ Chat parse error', e);
                }
            });
        } catch (e) {
            addAlert({
                type: "error",
                message: "Đã có lỗi xảy ra khi đăng ký nhận tin nhắn.",
            });
            return null;
        }
    }, [addAlert]);

    const subscribeNotify = useCallback((destination, callback) => {
        if (!notifyClientRef.current?.connected) return null;

        try {
            return notifyClientRef.current.subscribe(destination, (msg) => {
                try {
                    const payload = JSON.parse(msg.body);
                    callback(payload);
                } catch (e) {
                    console.error('❌ Notification parse error', e);
                }
            });
        } catch (e) {
            console.error('❌ Failed to subscribe to notification', e);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!user?.id || hasInitializedRef.current) return;

        hasInitializedRef.current = true;

        const token = getAccessToken();
        if (token) {
            connectChat(token);
        }
        connectNotification();

        return () => {
            hasInitializedRef.current = false;
            disconnect();
        };
    }, [user?.id, connectChat, connectNotification, disconnect]);

    return (
        <StompContext.Provider
            value={{
                chatConnected,
                notifyConnected,
                sendChat,
                sendMessageToUser,
                subscribeNotify,
                subscribeChat,
                disconnect,
            }}
        >
            {children}
        </StompContext.Provider>
    );
};