const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * Auto-assigns the most available staff member for a booking.
 * Strategy: Find available staff in the same clientId with fewest appointments today.
 * Optional: Prioritize staff in the same city.
 */
const autoAssignStaff = async (clientId, preferredCity = '') => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Find all available staff for this client
        const staffRoles = ['hr', 'doctor', 'interviewer', 'service', 'employee'];
        const query = {
            clientId,
            role: { $in: staffRoles },
            isBlocked: false,
            availabilityStatus: { $ne: 'offline' }
        };

        // If a city is provided (from the booking data), prioritize staff in that city
        let availableStaff = await User.find(query).select('_id name availabilityStatus city');

        if (!availableStaff.length) return null;

        // Count today's appointments for each staff member
        const staffWithLoad = await Promise.all(
            availableStaff.map(async (staff) => {
                const todayCount = await Appointment.countDocuments({
                    $or: [{ hrId: staff._id }, { adminId: staff._id }],
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                });
                // Prioritize 'available' over 'busy'
                const statusWeight = staff.availabilityStatus === 'available' ? 0 : 10;
                // Prioritize same city (subtract weight if same city)
                const cityWeight = (preferredCity && staff.city?.toLowerCase() === preferredCity.toLowerCase()) ? -5 : 0;
                
                return { staff, load: todayCount + statusWeight + cityWeight };
            })
        );

        // Sort by load (ascending) — least busy gets assigned
        staffWithLoad.sort((a, b) => a.load - b.load);
        return staffWithLoad[0]?.staff || null;
    } catch (err) {
        console.error('❌ AutoAssign Error:', err.message);
        return null;
    }
};

module.exports = { autoAssignStaff };
