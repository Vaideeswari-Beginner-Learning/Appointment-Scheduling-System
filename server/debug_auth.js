const axios = require('axios');

const API_URL = 'http://localhost:5002/api';
const testData = {
    name: 'Debug User',
    email: 'debug' + Date.now() + '@example.com',
    password: 'password123'
};

async function runTest() {
    console.log('--- STARTING AUTH DEBUG ---');
    
    try {
        console.log('1. Attempting Register:', testData.email);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            ...testData,
            role: 'client', // Testing as client
            userType: 'client'
        });
        console.log('✅ Register Success. User ID:', regRes.data.user.id);
        console.log('User Details from server:', JSON.stringify(regRes.data.user, null, 2));

        console.log('\n2. Attempting Login:', testData.email);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testData.email,
            password: testData.password
        });
        console.log('✅ Login Success. Token:', loginRes.data.token.substring(0, 10) + '...');
        
    } catch (err) {
        console.log('❌ TEST FAILED');
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log('Error:', err.message);
        }
    }
}

runTest();
