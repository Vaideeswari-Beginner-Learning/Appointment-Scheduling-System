const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Enhanced Notification Service for SaaS
 * Supports In-app, Email, SMS, and WhatsApp (Mocks for now)
 */
class NotificationService {
    
    /**
     * Send notification across multiple channels
     * @param {string} userId - ID of the user to notify
     * @param {object} content - { title, message, type }
     * @param {array} channels - ['in_app', 'email', 'sms', 'whatsapp']
     */
    static async notify(userId, content, channels = ['in_app']) {
        try {
            const user = await User.findById(userId);
            if (!user) return;

            // 1. In-App Notification (Persistent in DB)
            if (channels.includes('in_app')) {
                const newNotif = new Notification({
                    userId,
                    title: content.title,
                    message: content.message,
                    type: content.type || 'info'
                });
                await newNotif.save();
            }

            // 2. Mock Email
            if (channels.includes('email')) {
                console.log(`📧 [EMAIL SENT] To: ${user.email} | Subject: ${content.title} | Body: ${content.message}`);
                // Implementation for Nodemailer/SendGrid would go here
            }

            // 3. Mock SMS
            if (channels.includes('sms')) {
                console.log(`📱 [SMS SENT] To: ${user.phone || 'N/A'} | Msg: ${content.message}`);
                // Implementation for Twilio/SNS would go here
            }

            // 4. Mock WhatsApp
            if (channels.includes('whatsapp')) {
                console.log(`🟩 [WHATSAPP SENT] To: ${user.phone || 'N/A'} | Msg: ${content.message}`);
                // Implementation for Twilio WhatsApp/Meta API would go here
            }

            return { success: true };
        } catch (err) {
            console.error('❌ [NotificationService Error]:', err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Specialized: Triggered when a client exhausts their plan credentials (HR, Staff, etc.)
     */
    static async notifyQuotaExhausted(clientId, resourceType, limit) {
        const content = {
            title: '⚠️ Plan Limit Reached!',
            message: `Your organization has reached the maximum limit of ${limit} ${resourceType}. Please upgrade your plan or add credits to continue growing your team.`,
            type: 'warning'
        };

        // Send to all channels for high urgency
        return this.notify(clientId, content, ['in_app', 'email', 'sms', 'whatsapp']);
    }
}

module.exports = NotificationService;
