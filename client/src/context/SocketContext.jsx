import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketUrl = SERVER_URL;
        const newSocket = io(socketUrl, { 
            withCredentials: true,
            transports: ['polling', 'websocket'] 
        });
        setSocket(newSocket);

        if (user?.clientId) {
            newSocket.emit('join_tenant', user.clientId);
        }

        return () => newSocket.close();
    }, [user?.clientId]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
