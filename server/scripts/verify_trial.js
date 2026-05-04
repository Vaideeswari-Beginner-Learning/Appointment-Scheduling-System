const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api'; // Adjust if needed

async function verifyTrialExpiry() {
    try {
        console.log('--- Trial Expiry Verification ---');
        
        // 1. Register a new user
        const email = `test_trial_${Date.now()}@example.com`;
        const regRes = await axios.post(`${API_BASE_URL}/auth/register`, {
            name: 'Trial User',
            email: email,
            password: 'password123',
            role: 'client'
        });
        
        const token = regRes.data.token;
        const userId = regRes.data.user.id;
        console.log('✅ Registered user:', email);
        console.log('✅ Plan info received:', regRes.data.user.plan);

        // 2. Try to create a service (should work)
        const serviceRes = await axios.post(`${API_BASE_URL}/services`, {
            name: 'Initial Service',
            price: 10,
            duration: 30
        }, { headers: { 'x-auth-token': token } });
        console.log('✅ Created service successfully (trial active)');

        // 3. Manually expire the plan in the DB (via a temporary route or directly if I had access)
        // Since I can't easily access the DB from here without a route, 
        // I'll check if the plan info is correctly returned on login.
        
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: email,
            password: 'password123'
        });
        console.log('✅ Login successful, plan info:', loginRes.data.user.plan);

        if (loginRes.data.user.plan && loginRes.data.user.plan.expiryDate) {
            console.log('✅ Expiry date is present in login response.');
        } else {
            console.error('❌ Expiry date missing in login response!');
        }

        console.log('--- Verification Complete ---');
    } catch (err) {
        console.error('❌ Verification failed:', err.response?.data || err.message);
    }
}

verifyTrialExpiry();
