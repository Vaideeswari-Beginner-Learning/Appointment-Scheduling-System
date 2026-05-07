const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initCron } = require('./services/cronService');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.set('trust proxy', 1);

// 1. STANDARD CORS PACKAGE (Mirrors Origin for Vercel/Localhost)
app.use(cors({
    origin: (origin, callback) => {
        // Log the origin for every request to debug Render logs
        if (origin) console.log(`📡 [CORS_REQUEST] Origin: ${origin}`);
        
        if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            console.warn(`⚠️ [CORS_REJECTED] Origin: ${origin}`);
            callback(null, true); // Allow anyway for debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept', 'Origin', 'X-Requested-With']
}));

// Health Check for CORS & Deployment
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        origin: req.headers.origin,
        headers: req.headers,
        timestamp: new Date().toISOString() 
    });
});

// Middleware
app.use(express.json());

const server = http.createServer(app);

// 2. GREEDY SOCKET.IO CORS
const io = new Server(server, {
    cors: {
        origin: true, // Mirrors the requesting origin automatically
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["x-auth-token", "Authorization", "Content-Type", "Accept", "Origin"]
    },
    allowEIO3: true // Support older clients just in case
});

// Make io accessible in routes
app.set('io', io);

// Request logger
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Socket.io Connection
io.on('connection', (socket) => {
    console.log(`🔌 New Socket Connection: ${socket.id}`);
    
    socket.on('join_tenant', (clientId) => {
        socket.join(clientId);
        console.log(`🏠 Socket ${socket.id} joined tenant: ${clientId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Socket Disconnected: ${socket.id}`);
    });
});

// Setup modular routes
app.get('/api/ping', (req, res) => res.json({ status: 'API ALIVE', time: new Date().toLocaleTimeString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/hiring', require('./routes/hiring'));
app.use('/api/services', require('./routes/services'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/saas', require('./routes/saas'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));

// Database connection logic
const initDB = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to Database');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};

// Only run startup logic if not imported as a module (e.g. by Vercel)
if (require.main === module) {
    initDB().then(() => {
        const PORT = process.env.PORT || 5002;
        server.listen(PORT, () => {
            console.log(`🚀 SERVER ACTIVE ON PORT ${PORT}`);
            initCron();
        });
    });
} else {
    initDB();
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`🚨 SERVER ERROR: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
});

module.exports = app;

