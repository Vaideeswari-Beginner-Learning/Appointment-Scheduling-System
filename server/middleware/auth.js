const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        console.warn(`[AUTH] 401: No token provided for ${req.method} ${req.url}`);
        console.log('Headers received:', req.headers);
        return res.status(401).json({ message: 'No token, authorization denied. Please include x-auth-token header.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const payload = decoded.user || decoded;
        req.user = {
            id:   payload.id   || payload._id,
            role: payload.role || 'user',
            name: payload.name,
            email: payload.email,
            department: payload.department,
            clientId: payload.clientId
        };
        next();
    } catch (e) {
        console.error(`❌ [AUTH ERROR] ${req.method} ${req.url} - ${e.name}: ${e.message}`);
        res.status(400).json({ message: 'Session invalid or token expired', error: e.message });
    }
};
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            console.warn(`[AUTH] 403: Session payload invalid for ${req.method} ${req.url}`);
            return res.status(403).json({ message: 'Session payload invalid or expired. Please Log Out and Log In again.' });
        }
        
        const userRole = req.user.role.toLowerCase();
        // super-admin can access everything if we want, but let's stick to explicit roles for now
        const hasPermission = roles.length === 0 || roles.some(r => r.toLowerCase() === userRole) || userRole === 'super-admin';

        if (!hasPermission) {
            console.warn(`[AUTH] 403: Role mismatch. Required: [${roles}], Actual: [${req.user.role}] for ${req.method} ${req.url}`);
            return res.status(403).json({ message: `Forbidden. Your role (${req.user.role}) is not authorized.` });
        }
        next();
    };
};

const tenantGuard = (req, res, next) => {
    if (!req.user) {
         return res.status(401).json({ message: 'Authentication required' });
    }
    // Normalize role for comparison
    const userRole = (req.user.role || '').toLowerCase();

    // Super-admins and standard Users (Customers) should NOT be filtered by clientId at the tenant level
    // for their personal lists (though routes may still filter by userId).
    if (userRole === 'super-admin' || userRole === 'user') {
        req.tenantFilter = {}; 
        return next();
    }

    if (!req.user.clientId) {
        // Fallback for roles that might not have a clientId yet
        const globalRoles = ['doctor', 'service', 'interviewer', 'admin', 'client', 'hr']; 
        if (globalRoles.includes(userRole)) {
            req.tenantFilter = {};
            return next();
        }

        console.warn(`[AUTH] 403: Missing clientId for user ${req.user.id} (${req.user.role}) at ${req.method} ${req.url}`);
        return res.status(403).json({ 
            message: `Tenant access required for role (${req.user.role}). Please LOG OUT and LOG IN again to refresh your organization metadata.`,
            debug: { role: req.user.role, id: req.user.id, hasClientId: !!req.user.clientId }
        });
    }

    // Attach tenant isolation query object to the request for easy filtering
    // This ensures Staff/Admins only see data belonging to their organization
    req.tenantFilter = { clientId: req.user.clientId };
    next();
};

const planGuard = async (req, res, next) => {
    try {
        // Only enforce plan limits for roles that belong to a client organization
        // Super-admins and standard Users (Customers) are exempt from client plan freezing
        const restrictedRoles = ['client', 'hr', 'employee', 'doctor', 'service', 'interviewer', 'admin'];
        if (!req.user || !restrictedRoles.includes(req.user.role?.toLowerCase())) {
            return next();
        }

        const clientId = req.user.clientId;
        if (!clientId || !require('mongoose').Types.ObjectId.isValid(clientId)) {
            return next();
        }
        
        const client = await User.findById(clientId);
        if (!client) return next();

        // Check if plan has expired
        if (client.plan && client.plan.expiryDate && new Date(client.plan.expiryDate) < new Date()) {
            // Auto-update status to expired if it's not already
            if (client.plan.status !== 'expired') {
                client.plan.status = 'expired';
                await client.save();
            }
            
            console.warn(`⏳ [PLAN_EXPIRED] Blocked request from ${req.user.email} (${req.user.role}) - Trial ended on ${client.plan.expiryDate}`);
            
            return res.status(403).json({ 
                message: 'Your 1-day training period has expired. Please upgrade your plan to unlock full dashboard access.',
                isExpired: true,
                type: 'PLAN_EXPIRED'
            });
        }
        next();
    } catch (err) {
        console.error('❌ [PLAN_GUARD_ERROR]:', err.message);
        next(err);
    }
};

module.exports = { auth, authorize, tenantGuard, planGuard };
