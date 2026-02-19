import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth(); // Only connect when user is logged in

    useEffect(() => {
        if (user) {
            const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                withCredentials: true,
                transports: ['websocket'], // Force websocket for better performance
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            // Bridge Socket events to Window events for global reactivity
            socketInstance.on('subscription_added', (data) => {
                window.dispatchEvent(new CustomEvent('subscription_added', { detail: data }));
                const prefs = JSON.parse(localStorage.getItem('spendora_prefs') || '{"push":true}');
                if (prefs.push) {
                    // specific toast import needed or use window.dispatchEvent to a ToastManager
                    // For simplicity, we can dispatch a 'show_toast' event if we had one, or just import toast here if allowed.
                    // But context usually shouldn't render UI.
                    // Let's stick to dispatching, and have a separate component handle toasts?
                    // Actually, we can just use the CustomEvent in a useToastListener hook in App.tsx.
                    // But user wants "real time", so let's do it here if possible.
                    // We can't import toast from react-hot-toast if this is just a context file (it is valid code, just logic resides in provider).
                    // But to keep it clean, let's just emit the window event and have a listener in App.tsx or NotificationToast.tsx.
                }
            });

            socketInstance.on('subscription_updated', (data) => {
                window.dispatchEvent(new CustomEvent('subscription_updated', { detail: data }));
            });

            socketInstance.on('subscription_deleted', (data) => {
                window.dispatchEvent(new CustomEvent('subscription_deleted', { detail: data }));
            });

            // Payment Processed Event (New)
            socketInstance.on('payment_processed', (data) => {
                window.dispatchEvent(new CustomEvent('payment_processed', { detail: data }));
                const prefs = JSON.parse(localStorage.getItem('spendora_prefs') || '{"push":true}');
                if (prefs.push) {
                    // We will handle the toast in NotificationToast.tsx by listening to this event
                }
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
