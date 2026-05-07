const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initCron } = require('./services/cronService');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🚀 [BOOT] Server script initialization...');

const app = express();
app.set('trust proxy', 1);

// 1. EXPLICIT CORS CONFIGURATION
const allowedOrigins = [
    'https://appointmentscheduling-system.vercel.app',
    'http://localhost:5173',
    'http://localhost:5002',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.log('CORS Blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Diagnostic Routes
app.get('/', (req, res) => res.send('✅ Appointment System API - Online'));
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        origin: req.headers.origin,
        timestamp: new Date().toISOString() 
    });
});

// Middleware
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

// 2. SOCKET.IO CONFIGURATION
const io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io/'
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
    console.log(`⭐ [STARTUP] Initializing database and server...`);
    initDB().then(() => {
        const PORT = process.env.PORT || 5002;
        console.log(`⭐ [STARTUP] Attempting to listen on PORT: ${PORT}`);
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 [SUCCESS] SERVER ACTIVE ON PORT ${PORT}`);
            console.log(`🔗 [INFO] Health check available at /api/health`);
            initCron();
        }).on('error', (err) => {
            console.error(`🚨 [CRITICAL] Server failed to start:`, err);
        });
    }).catch(err => {
        console.error(`🚨 [CRITICAL] DB/Server Init failed:`, err);
    });
} else {
    console.log(`⭐ [IMPORT] Server imported as module (likely Vercel/Function)`);
    initDB();
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`🚨 SERVER ERROR: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
});

module.exports = app;

