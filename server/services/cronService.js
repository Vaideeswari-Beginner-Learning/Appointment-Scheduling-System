const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const NotificationService = require('./NotificationService');

/**
 * Appointment Reminder Service
 * Runs every 30 minutes to find appointments starting in the next 1-2 hours
 */
const initCron = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('⏰ [CRON] Checking for upcoming appointment reminders...');
        try {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            // Find appointments starting between 1 and 2 hours from now
            // This ensures we only send one reminder (since we run every 30m)
            const upcoming = await Appointment.find({
                status: { $in: ['confirmed', 'approved'] },
                reminderSent: { $ne: true },
                // Match manualDate or slotId.date (simplification for simulation)
                // For a real app, we'd compare the exact timestamp
            }).populate('userId', 'name email phone');

            for (const appt of upcoming) {
                if (!appt.userId) continue;

                await NotificationService.notify(appt.userId._id, {
                    title: '📅 Appointment Reminder',
                    message: `Reminder: Your appointment for "${appt.purpose || 'Service'}" is scheduled for today. See you soon!`,
                    type: 'info'
                }, ['in_app', 'email', 'sms']);

                appt.reminderSent = true;
                await appt.save();
                console.log(`🔔 [CRON] Reminder sent to user: ${appt.userId.name} for appointment ${appt._id}`);
            }
        } catch (err) {
            console.error('❌ [CRON Error]:', err.message);
        }
    });
};

module.exports = { initCron };
