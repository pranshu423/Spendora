import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

let socket: Socket;

export const useSocket = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (user && !socket) {
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            socket = io(socketUrl, {
                query: { userId: user._id },
                transports: ['websocket'],
            });

            socket.on('connect', () => {
                console.log('Connected to socket server');
            });

            socket.on('notification', (data: { title: string; message: string }) => {
                toast((_t) => (
                    <div className="flex flex-col">
                        <span className="font-bold">{data.title}</span>
                        <span className="text-sm">{data.message}</span>
                    </div>
                ), {
                    duration: 5000,
                    position: 'top-right',
                });
            });

            // Listen for subscription events and dispatch window events for components to react
            socket.on('subscription_added', () => {
                window.dispatchEvent(new Event('subscription_added'));
                toast.success('Subscription added successfully');
            });

            socket.on('subscription_updated', () => {
                window.dispatchEvent(new Event('subscription_updated'));
                toast.success('Subscription updated');
            });

            socket.on('subscription_deleted', () => {
                window.dispatchEvent(new Event('subscription_deleted'));
                toast.success('Subscription deleted');
            });

            return () => {
                if (socket) {
                    socket.disconnect();
                }
            };
        }
    }, [user]);

    return socket;
};
