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

const allowedOrigins = [
    "https://appointmentscheduling-system.vercel.app",
    "https://appointmentscheduling-system-git-main-vaideeswari-beginner-learnings-projects.vercel.app", // Common Vercel preview pattern
    "http://localhost:5173",
    "http://localhost:5002",
    "http://localhost:3000"
];

const app = express();

// 1. Manually Handle Preflight & Headers (Before CORS middleware for safety)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, x-auth-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
        credentials: true
    }
});

// Make io accessible in routes
app.set('io', io);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

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

