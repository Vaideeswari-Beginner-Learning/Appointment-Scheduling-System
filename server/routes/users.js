const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Appointment = require('../models/Appointment');
const { auth, authorize, tenantGuard, planGuard } = require('../middleware/auth');
const NotificationService = require('../services/NotificationService');

/**
 * users.js
 * Admin routes for user management.
 */

// Bulk Delete All Users (Super Admin Only) - ONLY deletes role: 'user'
router.delete('/bulk/delete-all-users', auth, authorize('super-admin'), async (req, res) => {
    try {
        console.log('🚮 [BULK DELETE] Starting platform-wide user cleanup');
        const result = await User.deleteMany({ role: 'user' });
        console.log(`✅ [BULK DELETE] Removed ${result.deletedCount} standard users`);
        res.json({ message: `Successfully deleted ${result.deletedCount} standard users.`, count: result.deletedCount });
    } catch (err) {
        res.status(500).json({ message: 'Bulk deletion failed', error: err.message });
    }
});

router.get('/hr-list', auth, async (req, res) => {
    let query = { role: 'hr' };
    try {
        const { department } = req.query;
        if (department) query.department = department;

        console.log('--- HR LIST FETCH --- Query:', query);
        const hrUsers = await User.find(query).select('name email department').lean();
        res.json(hrUsers);
    } catch (err) {
        console.error('❌ [SERVER ERROR] HR List Query Failed:', {
            message: err.message,
            stack: err.stack,
            queryUsed: query
        });
        res.status(500).json({ 
            success: false, 
            message: 'Server error retrieving HR List: ' + err.message,
            trace: process.env.NODE_ENV === 'development' ? err.stack : undefined 
        });
    }
});

// Get Customers (Admin & HR)
router.get('/customer-list', auth, tenantGuard, authorize(['admin', 'hr', 'client']), async (req, res) => {
    try {
        const effectiveClientId = req.tenantFilter?.clientId || req.user.id;
        
        // 🚨 Validate ObjectId before querying to prevent CastError/500
        if (!mongoose.Types.ObjectId.isValid(effectiveClientId)) {
            console.warn(`⚠️ [CUSTOMER LIST] Invalid ID format: ${effectiveClientId}`);
            return res.json([]);
        }

        // 1. Fetch all appointments matching this clientId
        const appts = await Appointment.find({ clientId: effectiveClientId }).select('userId');
        
        // 2. Extract unique users who made bookings
        const uniqueUserIds = [...new Set(appts.map(a => a.userId?.toString()).filter(id => id))];
        
        // 3. Fetch user details for those unique customers
        const customers = await User.find({ _id: { $in: uniqueUserIds }, role: 'user' })
                                    .select('name email phone createdAt')
                                    .sort({ createdAt: -1 });
                                    
        res.json(customers);
    } catch (err) {
        console.error('❌ [CUSTOMER LIST ERROR]:', err);
        res.status(500).json({ message: 'Server error fetching customers: ' + err.message });
    }
});

// Update OWN Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, bio, specialty } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }
        if (specialty) user.specialty = specialty;
        // Bio can be stored in metadata or just ignored if not in schema
        
        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Get Professional List for generic departments
router.get('/professionals', auth, async (req, res) => {
    try {
        const { department } = req.query;
        let query = { role: { $in: ['doctor', 'hr', 'admin', 'interviewer', 'service'] } }; 
        if (department) query.department = department;

        const staff = await User.find(query).select('name email specialty department role');
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching professionals' });
    }
});

// Get Doctor List (New Hospital Function)
router.get('/doctors', auth, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email specialty department');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Professional List (Legacy/Other)
router.get('/doctor-list', auth, authorize(['admin', 'hr', 'doctor', 'interviewer', 'service']), async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Professionals by Department (New Unified Function)
router.get('/professionals-by-dept', auth, async (req, res) => {
    try {
        const { department } = req.query;
        if (!department) return res.status(400).json({ message: 'Department is required' });
        
        const professionals = await User.find({ 
            role: { $in: ['doctor', 'interviewer', 'service'] },
            department: department 
        }).select('name email specialty department role');
        
        res.json(professionals);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Client (Super Admin Only)
router.post('/create-client', auth, authorize('super-admin'), async (req, res) => {
    try {
        const { name, email, password, planType, sector, subCategory } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Set Plan Defaults
        let maxHr = 2;
        let maxEmployees = 10;
        if (planType === 'paid') {
            maxHr = 100;
            maxEmployees = 500;
        }

        user = new User({ 
            name, 
            email, 
            password, 
            role: 'client', 
            userType: 'client', 
            plan: { type: planType || 'free', maxHr, maxEmployees, status: 'active' },
            sector: sector || 'general',
            subCategory: subCategory || ''
        });
        await user.save();
        
        // Ensure self-referencing clientId for strict isolation matching
        user.clientId = user._id;
        await user.save();

        res.status(201).json({ message: 'Client Account created successfully', user: { id: user._id, name, email, plan: user.plan } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create Standard User (Admin Only)
router.post('/create-standard-user', auth, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password, userType } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Basic fields required' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ 
            name, 
            email, 
            password, 
            role: 'user', 
            userType: userType || 'interview' 
        });
        await user.save();
        res.status(201).json({ message: 'Standard User account created successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create HR (Admin & Client Only)
router.post('/create-hr', auth, planGuard, tenantGuard, authorize(['super-admin', 'client']), async (req, res) => {
    try {
        const { name, email, password, department, clientId } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const targetClientId = req.user.role === 'super-admin' ? clientId : req.user.clientId;

        let finalSector = 'general';
        let finalSectorId = null;

        if (targetClientId) {
            const clientOrg = await User.findById(targetClientId);
            if (!clientOrg) return res.status(404).json({ message: 'Client Organization not found' });
            
            if (clientOrg.sector) finalSector = clientOrg.sector;
            if (clientOrg.sectorId) finalSectorId = clientOrg.sectorId;

            const currentHrCount = await User.countDocuments({ role: 'hr', clientId: targetClientId });
            const limit = clientOrg.plan?.maxHr || 2; // Default to free limit of 2 if undefined
            
            if (currentHrCount >= limit) {
                // Trigger Multi-channel notification
                await NotificationService.notifyQuotaExhausted(targetClientId, 'HR Managers', limit);
                return res.status(403).json({ message: `Plan limit reached. Your current plan only allows ${limit} HR accounts. We have sent an upgrade alert to your registered mobile and email.` });
            }
        }

        user = new User({ 
            name, 
            email, 
            password, 
            role: 'hr', 
            department: department || '',
            clientId: targetClientId || null,
            sector: finalSector,
            sectorId: finalSectorId
        });
        await user.save();
        res.status(201).json({ message: 'HR account created successfully', user: { id: user._id, name, role: user.role } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create Professional/Staff (Admin, Client & HR)
router.post('/create-professional', auth, planGuard, tenantGuard, authorize(['super-admin', 'client', 'hr']), async (req, res) => {
    try {
        const { name, email, password, specialty, role, department, workingHours } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Basic fields are required' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });

        const targetClientId = req.user.role === 'super-admin' ? (req.body.clientId || null) : req.user.clientId;

        let finalSector = 'general';
        let finalSectorId = null;

        // Plan Validation for Employees
        if (targetClientId) {
            const clientOrg = await User.findById(targetClientId);
            if (clientOrg) {
                if (clientOrg.sector) finalSector = clientOrg.sector;
                if (clientOrg.sectorId) finalSectorId = clientOrg.sectorId;

                const limit = clientOrg.plan?.maxEmployees || 10;
                const currentEmpCount = await User.countDocuments({ role: { $in: ['employee', 'doctor', 'interviewer', 'service'] }, clientId: targetClientId });
                if (currentEmpCount >= limit) {
                    // Trigger Multi-channel notification
                    await NotificationService.notifyQuotaExhausted(targetClientId, 'Employees/Staff', limit);
                    return res.status(403).json({ message: `Plan limit reached. Your current plan allows only ${limit} employees/staff. Upgrade notification sent to your Email, SMS, and WhatsApp.` });
                }
            }
        }

        // Map department value to a valid userType enum
        const deptToUserType = {
            hospital: 'hospital',
            doctor:   'hospital',
            service:  'service',
            interview:'interview',
            interviewer:'interview',
            client:   'client',
            hr:       'client',
            employee: 'client',
        };
        const resolvedUserType = deptToUserType[department?.toLowerCase()] || 'client';

        user = new User({ 
            name, 
            email, 
            password, 
            role: role || 'employee', 
            department: department || 'hospital', 
            specialty: specialty || '',
            userType: resolvedUserType,
            workingHours: workingHours || '',
            isApproved: true,
            clientId: targetClientId,
            sector: finalSector,
            sectorId: finalSectorId
        });
        await user.save();
        res.status(201).json({ message: 'Staff onboarded successfully', user: { id: user._id, name, role: user.role } });
    } catch (err) { 
        console.error('[create-professional ERROR]', err.message);
        res.status(500).json({ message: err.message }); 
    }
});


// Alias for backward compatibility (Optional, but good for stability)
router.post('/create-doctor', auth, authorize(['admin', 'hr']), async (req, res) => {
    req.body.role = 'doctor';
    req.body.department = 'hospital';
    // Forward to the new generic handler logic or just replicate
    try {
        const { name, email, password, specialty } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email already registered' });
        user = new User({ name, email, password, role: 'doctor', department: 'hospital', specialty, userType: 'hospital', isApproved: true });
        await user.save();
        res.status(201).json({ message: 'Medical staff onboarded successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get Users (Super Admin views all, Client & HR views tenant users)
router.get('/', auth, tenantGuard, authorize(['super-admin', 'client', 'hr']), async (req, res) => {
    try {
        const query = req.tenantFilter || {};
        const users = await User.find(query).select('-password').populate('clientId', 'name').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { 
        console.error('❌ [GET USERS ERROR]:', err);
        res.status(500).json({ message: 'Server error: ' + err.message }); 
    }
});

// Get Clients by Sector (Public)
router.get('/clients-by-sector/:sector', async (req, res) => {
    try {
        const { sector } = req.params;
        const clients = await User.find({ 
            role: 'client', 
            sector: sector,
            isBlocked: false 
        }).select('name email avatar sector clientId');
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching clients by sector' });
    }
});

// Get Single User (Admin & HR)
router.get('/:id', auth, authorize(['admin', 'hr']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Public Directory (All Active Clients) - No Auth Required
router.get('/public/directory', async (req, res) => {
    try {
        const clients = await User.find({ 
            role: 'client', 
            isBlocked: false,
            sector: { $ne: null }
        }).select('name email avatar sector subCategory clientId organizationName organizationLogo');
        res.json(clients);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching directory data' });
    }
});

// Get basic tenant info (Public - No Auth Required for Mini Website)
router.get('/public/tenant-info/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Organization ID format' });
        }
        const user = await User.findById(req.params.id).select('name role userType sector organizationName organizationLogo organizationDescription organizationWebsite');
        if (!user || user.role !== 'client') return res.status(404).json({ message: 'Organization not found' });
        res.json(user);
    } catch (err) {
        console.error('❌ Tenant info fetch error:', err);
        res.status(500).json({ message: 'Server error fetching organization data' });
    }
});

// Get basic tenant info (Any authenticated user)
router.get('/tenant-info/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name role userType sector organizationName organizationLogo organizationDescription organizationWebsite');
        if (!user || user.role !== 'client') return res.status(404).json({ message: 'Organization not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle Block Status (Admin & Client)
router.patch('/:id/block', auth, authorize(['admin', 'client']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Security: Client can only block users in their own tenant
        if (req.user.role === 'client' && user.clientId?.toString() !== req.user.clientId?.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Access denied to other tenant data' });
        }
        
        if (user.role === 'admin' || user.role === 'super-admin') return res.status(403).json({ message: 'Cannot block admins' });

        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User
router.delete('/:id', auth, tenantGuard, authorize(['admin', 'client', 'super-admin', 'hr']), async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });
        
        // Security Check: Users cannot delete themselves
        if (req.user.id.toString() === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Security: Client/HR can only delete users in their own tenant
        if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
             if (userToDelete.clientId?.toString() !== req.user.clientId?.toString()) {
                return res.status(403).json({ message: 'Unauthorized: Access denied to other tenant data' });
             }
        }
        
        // Protection: Cannot delete other admins
        if (userToDelete.role === 'admin' || userToDelete.role === 'super-admin') {
            return res.status(403).json({ message: 'Cannot delete platform admins' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Toggle Approval Status (Admin Only)
router.patch('/:id/approve', auth, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isApproved = !user.isApproved;
        await user.save();
        res.json({ message: `User ${user.isApproved ? 'approved' : 'unapproved'} successfully`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Update User Details (Admin, Client & User Self-Update)
router.patch('/:id', auth, authorize(['admin', 'client', 'super-admin', 'user']), async (req, res) => {
    try {
        const { name, email, password, department, specialty, phone, organizationName, organizationLogo, organizationDescription, organizationWebsite, organizationImages, organizationStory, organizationPurpose } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Security Check: Users can only update their own profile unless they are admin/client
        if (req.user.role === 'user' && String(req.user.id) !== String(req.params.id)) {
            console.warn(`[403 FORBIDDEN] User Update Blocked: req.user.id=${req.user.id} vs req.params.id=${req.params.id}`);
            return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
        }

        // Security: Client can only update users in their own tenant
        if (req.user.role === 'client' && String(user.clientId) !== String(req.user.clientId)) {
            console.warn(`[403 FORBIDDEN] Client Update Blocked for tenant ID mismatch: user.clientId=${user.clientId} vs req.user.clientId=${req.user.clientId}`);
            return res.status(403).json({ message: 'Unauthorized: Access denied to other tenant data' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: user._id } });
            if (existing) return res.status(400).json({ message: 'Email already taken' });
            user.email = email;
        }
        if (password) user.password = password;
        if (req.body.sector) user.sector = req.body.sector;
        if (req.body.subCategory) user.subCategory = req.body.subCategory;
        if (organizationName !== undefined) user.organizationName = organizationName;
        if (organizationLogo !== undefined) user.organizationLogo = organizationLogo;
        if (organizationDescription !== undefined) user.organizationDescription = organizationDescription;
        if (organizationWebsite !== undefined) user.organizationWebsite = organizationWebsite;
        if (organizationImages !== undefined) user.organizationImages = organizationImages;
        if (organizationStory !== undefined) user.organizationStory = organizationStory;
        if (organizationPurpose !== undefined) user.organizationPurpose = organizationPurpose;
        
        // Admin/Client only fields
        if (req.user.role !== 'user') {
            if (department) user.department = department;
            if (specialty) user.specialty = specialty;
        }

        await user.save();
        res.json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user: ' + err.message });
    }
});

// Update User Role/Department (Admin Only)
router.patch('/:id/role', auth, authorize('admin'), async (req, res) => {
    try {
        const { role, department } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (role) user.role = role;
        if (department !== undefined) user.department = department;
        
        await user.save();
        res.json({ message: 'User role/department updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Upgrade User to Client (SaaS Onboarding)
router.post('/upgrade-to-client', auth, async (req, res) => {
    try {
        const { organizationName, sector, subCategory, address } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Change role to client
        user.role = 'client';
        user.userType = 'client';
        user.clientId = user._id; // Self-referencing clientId for strict isolation
        
        // Initialize 1-Day Trial
        const trialExpiry = new Date();
        trialExpiry.setHours(trialExpiry.getHours() + 24);
        
        user.plan = {
            type: 'free',
            status: 'active',
            expiryDate: trialExpiry,
            maxHr: 2,
            maxEmployees: 10
        };

        // Business Details
        user.organizationName = organizationName;
        user.sector = sector || 'general';
        user.subCategory = subCategory || '';
        user.address = address || '';

        await user.save();
        
        console.log(`🚀 [UPGRADE] User ${user.email} is now a Client. Trial expires: ${trialExpiry}`);
        
        res.json({ 
            message: 'Congratulations! You are now a Service Provider.', 
            user: { role: 'client', plan: user.plan } 
        });
    } catch (err) {
        res.status(500).json({ message: 'Upgrade failed: ' + err.message });
    }
});

// Update Client Plan (Super Admin)
router.patch('/:id/plan', auth, authorize('super-admin'), async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.plan = { ...user.plan, ...plan };
        await user.save();
        res.json({ message: 'Plan updated successfully', plan: user.plan });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Block/Unblock User
router.patch('/:id/block', auth, tenantGuard, authorize(['admin', 'client', 'hr']), async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });
        
        if (req.user.id === userToUpdate.id) {
            return res.status(400).json({ message: 'Cannot block yourself' });
        }

        userToUpdate.isBlocked = !userToUpdate.isBlocked;
        await userToUpdate.save();
        res.json({ message: `User status updated`, user: userToUpdate });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Public: Get staff for an organization (optionally filtered by service)
router.get('/public/staff/:clientId', async (req, res) => {
    try {
        const { serviceId } = req.query;
        if (!mongoose.Types.ObjectId.isValid(req.params.clientId)) {
            return res.status(400).json({ message: 'Invalid Client ID' });
        }
        
        let staffIds = null;
        const todayStr = new Date().toISOString().split('T')[0];

        // If serviceId is provided, find staff who have slots for this service
        if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
            const slots = await Slot.find({ 
                serviceId, 
                clientId: req.params.clientId,
                isBooked: false,
                date: { $gte: todayStr }
            });
            staffIds = [...new Set(slots.map(s => (s.professionalId || s.adminId)?.toString()).filter(id => id))];
        }

        const query = { 
            clientId: req.params.clientId, 
            role: { $in: ['hr', 'doctor', 'interviewer', 'service', 'employee', 'professional'] } 
        };

        if (staffIds) {
            query._id = { $in: staffIds };
        }

        const staff = await User.find(query).select('name email phone role bio avatar department specialty');

        // Fetch slots for each staff member
        const staffWithSlots = await Promise.all(staff.map(async (s) => {
            const slotQuery = { 
                adminId: s._id, 
                isBooked: false,
                date: { $gte: todayStr }
            };
            if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) slotQuery.serviceId = serviceId;

            const slots = await Slot.find(slotQuery).sort({ date: 1, startTime: 1 }).limit(5);
            
            return {
                ...s.toObject(),
                availableSlots: slots
            };
        }));

        res.json(staffWithSlots);
    } catch (err) {
        console.error('❌ Staff public fetch error:', err);
        res.status(500).json({ message: 'Error fetching staff data' });
    }
});

// Update availability status (Staff only)
router.patch('/me/availability', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['available', 'busy', 'offline'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use: available, busy, offline' });
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { availabilityStatus: status },
            { new: true }
        ).select('-password');
        res.json({ message: `Status updated to ${status}`, user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Public Staff Profile — shows name, experience, rating, completedJobs, reviews
router.get('/profile/:id', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid profile ID format' });
        }
        const staff = await User.findById(req.params.id)
            .select('name email avatar bio specialty department role experience completedJobs averageRating availabilityStatus');
        if (!staff) return res.status(404).json({ message: 'Profile not found' });

        // Fetch public reviews (appointments with rating > 0)
        const reviews = await require('../models/Appointment').find({
            $or: [{ adminId: staff._id }, { hrId: staff._id }],
            rating: { $gt: 0 }
        }).select('rating feedback patientName createdAt').sort({ createdAt: -1 }).limit(10);

        res.json({ ...staff.toObject(), reviews });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

module.exports = router;
